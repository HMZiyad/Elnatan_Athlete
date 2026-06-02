package repository

import (
	"context"
	"errors"
	"fmt"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/uag/backend/internal/models"
)

// ProductRepository handles product CRUD.
type ProductRepository struct {
	db *pgxpool.Pool
}

func NewProductRepository(db *pgxpool.Pool) *ProductRepository {
	return &ProductRepository{db: db}
}

func (r *ProductRepository) List(ctx context.Context, category, search string, page, perPage int) ([]models.Product, int, error) {
	offset := (page - 1) * perPage
	where := "WHERE 1=1"
	args := []interface{}{}
	i := 1

	if category != "" {
		where += fmt.Sprintf(" AND category = $%d", i)
		args = append(args, category)
		i++
	}
	if search != "" {
		where += fmt.Sprintf(" AND name ILIKE $%d", i)
		args = append(args, "%"+search+"%")
		i++
	}

	var total int
	cArgs := make([]interface{}, len(args))
	copy(cArgs, args)
	_ = r.db.QueryRow(ctx, `SELECT COUNT(*) FROM products `+where, cArgs...).Scan(&total)

	args = append(args, perPage, offset)
	rows, err := r.db.Query(ctx, fmt.Sprintf(`
		SELECT id, name, category, price, original_price, inventory, sizes, colors, image_url, status, rating, review_count, created_at, updated_at
		FROM products %s ORDER BY created_at DESC LIMIT $%d OFFSET $%d`, where, i, i+1), args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var products []models.Product
	for rows.Next() {
		p := models.Product{}
		if err := rows.Scan(&p.ID, &p.Name, &p.Category, &p.Price, &p.OriginalPrice, &p.Inventory,
			&p.Sizes, &p.Colors, &p.ImageURL, &p.Status, &p.Rating, &p.ReviewCount, &p.CreatedAt, &p.UpdatedAt); err != nil {
			return nil, 0, err
		}
		products = append(products, p)
	}
	return products, total, nil
}

func (r *ProductRepository) FindByID(ctx context.Context, id uuid.UUID) (*models.Product, error) {
	p := &models.Product{}
	err := r.db.QueryRow(ctx, `
		SELECT id, name, category, price, original_price, inventory, sizes, colors, image_url, status, rating, review_count, created_at, updated_at
		FROM products WHERE id = $1`, id,
	).Scan(&p.ID, &p.Name, &p.Category, &p.Price, &p.OriginalPrice, &p.Inventory,
		&p.Sizes, &p.Colors, &p.ImageURL, &p.Status, &p.Rating, &p.ReviewCount, &p.CreatedAt, &p.UpdatedAt)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, ErrNotFound
	}
	return p, err
}

func (r *ProductRepository) Create(ctx context.Context, p *models.Product) error {
	p.ID = uuid.New()
	return r.db.QueryRow(ctx, `
		INSERT INTO products (id, name, category, price, original_price, inventory, sizes, colors, image_url)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
		RETURNING status, rating, review_count, created_at, updated_at`,
		p.ID, p.Name, p.Category, p.Price, p.OriginalPrice, p.Inventory, p.Sizes, p.Colors, p.ImageURL,
	).Scan(&p.Status, &p.Rating, &p.ReviewCount, &p.CreatedAt, &p.UpdatedAt)
}

func (r *ProductRepository) Update(ctx context.Context, p *models.Product) error {
	_, err := r.db.Exec(ctx, `
		UPDATE products SET name=$1, category=$2, price=$3, original_price=$4, inventory=$5,
		                    sizes=$6, colors=$7, image_url=$8,
		                    status=CASE WHEN $5 > 0 THEN 'In Stock'::product_status ELSE 'Out of Stock'::product_status END
		WHERE id=$9`,
		p.Name, p.Category, p.Price, p.OriginalPrice, p.Inventory,
		p.Sizes, p.Colors, p.ImageURL, p.ID,
	)
	return err
}

func (r *ProductRepository) Delete(ctx context.Context, id uuid.UUID) error {
	res, err := r.db.Exec(ctx, `DELETE FROM products WHERE id = $1`, id)
	if err != nil {
		return err
	}
	if res.RowsAffected() == 0 {
		return ErrNotFound
	}
	return nil
}

func (r *ProductRepository) DecrementInventory(ctx context.Context, productID uuid.UUID, qty int) error {
	res, err := r.db.Exec(ctx,
		`UPDATE products SET inventory = inventory - $1,
		                     status = CASE WHEN inventory - $1 <= 0 THEN 'Out of Stock'::product_status ELSE 'In Stock'::product_status END
		 WHERE id = $2 AND inventory >= $1`,
		qty, productID,
	)
	if err != nil {
		return err
	}
	if res.RowsAffected() == 0 {
		return fmt.Errorf("OUT_OF_STOCK")
	}
	return nil
}
