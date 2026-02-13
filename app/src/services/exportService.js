const pool = require("../config/db");
const { writeUsersToCsv, writeDeltaCsv } = require("../utils/csvWriter");

const fullExport = async (consumerId, filename) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const result = await client.query(
      "SELECT * FROM users WHERE is_deleted = FALSE ORDER BY updated_at ASC"
    );

    const users = result.rows;

    await writeUsersToCsv(filename, users);

    if (users.length > 0) {
      const lastTimestamp = users[users.length - 1].updated_at;

      await client.query(
        `
        INSERT INTO watermarks (consumer_id, last_exported_at, updated_at)
        VALUES ($1, $2, NOW())
        ON CONFLICT (consumer_id)
        DO UPDATE SET
          last_exported_at = EXCLUDED.last_exported_at,
          updated_at = NOW()
        `,
        [consumerId, lastTimestamp]
      );
    }

    await client.query("COMMIT");

    return users.length;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

const incrementalExport = async (consumerId, filename) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const watermarkResult = await client.query(
      "SELECT last_exported_at FROM watermarks WHERE consumer_id = $1",
      [consumerId]
    );

    if (watermarkResult.rows.length === 0) {
      throw new Error("No watermark found. Run full export first.");
    }

    const lastExportedAt = watermarkResult.rows[0].last_exported_at;

    const result = await client.query(
      `
      SELECT * FROM users
      WHERE updated_at > $1
        AND is_deleted = FALSE
      ORDER BY updated_at ASC
      `,
      [lastExportedAt]
    );

    const users = result.rows;

    await writeUsersToCsv(filename, users);

    if (users.length > 0) {
      const newestTimestamp = users[users.length - 1].updated_at;

      await client.query(
        `
        UPDATE watermarks
        SET last_exported_at = $1,
            updated_at = NOW()
        WHERE consumer_id = $2
        `,
        [newestTimestamp, consumerId]
      );
    }

    await client.query("COMMIT");

    return users.length;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

const deltaExport = async (consumerId, filename) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const watermarkResult = await client.query(
      "SELECT last_exported_at FROM watermarks WHERE consumer_id = $1",
      [consumerId]
    );

    if (watermarkResult.rows.length === 0) {
      throw new Error("No watermark found. Run full export first.");
    }

    const lastExportedAt = watermarkResult.rows[0].last_exported_at;

    const result = await client.query(
      `
      SELECT * FROM users
      WHERE updated_at > $1
      ORDER BY updated_at ASC
      `,
      [lastExportedAt]
    );

    const users = result.rows;

    const recordsWithOperation = users.map((user) => {
      let operation;

      if (user.is_deleted) {
        operation = "DELETE";
      } else if (user.created_at.getTime() === user.updated_at.getTime()) {
        operation = "INSERT";
      } else {
        operation = "UPDATE";
      }

      return {
        operation,
        ...user,
      };
    });

    await writeDeltaCsv(filename, recordsWithOperation);

    if (users.length > 0) {
      const newestTimestamp = users[users.length - 1].updated_at;

      await client.query(
        `
        UPDATE watermarks
        SET last_exported_at = $1,
            updated_at = NOW()
        WHERE consumer_id = $2
        `,
        [newestTimestamp, consumerId]
      );
    }

    await client.query("COMMIT");

    return users.length;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

const getWatermark = async (consumerId) => {
  const result = await pool.query(
    "SELECT consumer_id, last_exported_at FROM watermarks WHERE consumer_id = $1",
    [consumerId]
  );

  if (result.rows.length === 0) {
    return null;
  }

  return result.rows[0];
};


module.exports = { fullExport, incrementalExport, deltaExport, getWatermark };
