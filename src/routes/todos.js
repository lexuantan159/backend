import express from 'express';
import { pool } from '../db.js';

const router = express.Router();

function normalizeTodo(row) {
  return {
    id: row.id,
    title: row.title,
    description: row.description || '',
    completed: row.completed,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

// GET /api/todos
router.get('/', async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT id, title, description, completed, created_at, updated_at
       FROM todos
       ORDER BY id DESC`
    );

    res.json(result.rows.map(normalizeTodo));
  } catch (error) {
    next(error);
  }
});

// GET /api/todos/:id
router.get('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ message: 'Invalid todo id.' });
    }

    const result = await pool.query(
      `SELECT id, title, description, completed, created_at, updated_at
       FROM todos
       WHERE id = $1`,
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Todo not found.' });
    }

    res.json(normalizeTodo(result.rows[0]));
  } catch (error) {
    next(error);
  }
});

// POST /api/todos
router.post('/', async (req, res, next) => {
  try {
    const { title, description = '', completed = false } = req.body;

    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return res.status(400).json({ message: 'Title is required.' });
    }

    const result = await pool.query(
      `INSERT INTO todos (title, description, completed)
       VALUES ($1, $2, $3)
       RETURNING id, title, description, completed, created_at, updated_at`,
      [title.trim(), description, Boolean(completed)]
    );

    res.status(201).json(normalizeTodo(result.rows[0]));
  } catch (error) {
    next(error);
  }
});

// PUT /api/todos/:id
router.put('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const { title, description = '', completed = false } = req.body;

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ message: 'Invalid todo id.' });
    }

    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return res.status(400).json({ message: 'Title is required.' });
    }

    const result = await pool.query(
      `UPDATE todos
       SET title = $1,
           description = $2,
           completed = $3
       WHERE id = $4
       RETURNING id, title, description, completed, created_at, updated_at`,
      [title.trim(), description, Boolean(completed), id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Todo not found.' });
    }

    res.json(normalizeTodo(result.rows[0]));
  } catch (error) {
    next(error);
  }
});

// PATCH /api/todos/:id/toggle
router.patch('/:id/toggle', async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ message: 'Invalid todo id.' });
    }

    const result = await pool.query(
      `UPDATE todos
       SET completed = NOT completed
       WHERE id = $1
       RETURNING id, title, description, completed, created_at, updated_at`,
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Todo not found.' });
    }

    res.json(normalizeTodo(result.rows[0]));
  } catch (error) {
    next(error);
  }
});

// DELETE /api/todos/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ message: 'Invalid todo id.' });
    }

    const result = await pool.query(
      `DELETE FROM todos
       WHERE id = $1
       RETURNING id`,
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Todo not found.' });
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
