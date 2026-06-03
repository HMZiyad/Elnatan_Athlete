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
		SELECT id, name, description, category, price, original_price, inventory, sizes, colors, image_url, status, rating, review_count, created_at, updated_at
		FROM products %s ORDER BY created_at DESC LIMIT $%d OFFSET $%d`, where, i, i+1), args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var products []models.Product
	for rows.Next() {
		p := models.Product{}
		if err := rows.Scan(&p.ID, &p.Name, &p.Description, &p.Category, &p.Price, &p.OriginalPrice, &p.Inventory,
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
		SELECT id, name, description, category, price, original_price, inventory, sizes, colors, image_url, status, rating, review_count, created_at, updated_at
		FROM products WHERE id = $1`, id,
	).Scan(&p.ID, &p.Name, &p.Description, &p.Category, &p.Price, &p.OriginalPrice, &p.Inventory,
		&p.Sizes, &p.Colors, &p.ImageURL, &p.Status, &p.Rating, &p.ReviewCount, &p.CreatedAt, &p.UpdatedAt)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, ErrNotFound
	}
	return p, err
}

func (r *ProductRepository) Create(ctx context.Context, p *models.Product) error {
	p.ID = uuid.New()
	return r.db.QueryRow(ctx, `
		INSERT INTO products (id, name, description, category, price, original_price, inventory, sizes, colors, image_url)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
		RETURNING status, rating, review_count, created_at, updated_at`,
		p.ID, p.Name, p.Description, p.Category, p.Price, p.OriginalPrice, p.Inventory, p.Sizes, p.Colors, p.ImageURL,
	).Scan(&p.Status, &p.Rating, &p.ReviewCount, &p.CreatedAt, &p.UpdatedAt)
}

func (r *ProductRepository) Update(ctx context.Context, p *models.Product) error {
	_, err := r.db.Exec(ctx, `
		UPDATE products SET name=$1, description=$2, category=$3, price=$4, original_price=$5, inventory=$6,
		                    sizes=$7, colors=$8, image_url=$9,
		                    status=CASE WHEN $6 > 0 THEN 'In Stock'::product_status ELSE 'Out of Stock'::product_status END
		WHERE id=$10`,
		p.Name, p.Description, p.Category, p.Price, p.OriginalPrice, p.Inventory,
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

func (r *ProductRepository) CreateReview(ctx context.Context, review *models.ProductReview) error {
	review.ID = uuid.New()
	
	// Start a transaction since we need to update the product's average rating as well
	tx, err := r.db.Begin(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback(ctx)

	// Upsert the review
	err = tx.QueryRow(ctx, `
		INSERT INTO product_reviews (id, product_id, user_id, rating, title, comment)
		VALUES ($1, $2, $3, $4, $5, $6)
		ON CONFLICT (product_id, user_id) 
		DO UPDATE SET 
			rating = EXCLUDED.rating, 
			title = EXCLUDED.title, 
			comment = EXCLUDED.comment, 
			updated_at = NOW()
		RETURNING id, created_at, updated_at
	`, review.ID, review.ProductID, review.UserID, review.Rating, review.Title, review.Comment).Scan(&review.ID, &review.CreatedAt, &review.UpdatedAt)
	
	if err != nil {
		return err
	}

	// Update the product's review_count and average rating
	_, err = tx.Exec(ctx, `
		UPDATE products
		SET review_count = (SELECT COUNT(*) FROM product_reviews WHERE product_id = $1),
		    rating = (SELECT COALESCE(AVG(rating), 0) FROM product_reviews WHERE product_id = $1)
		WHERE id = $1
	`, review.ProductID)
	
	if err != nil {
		return err
	}

	return tx.Commit(ctx)
}

func (r *ProductRepository) ListReviews(ctx context.Context, productID uuid.UUID) ([]models.ProductReview, error) {
	rows, err := r.db.Query(ctx, `
		SELECT r.id, r.product_id, r.user_id, r.rating, r.title, r.comment, r.created_at, r.updated_at,
		       u.full_name, u.avatar_url
		FROM product_reviews r
		JOIN users u ON r.user_id = u.id
		WHERE r.product_id = $1
		ORDER BY r.created_at DESC
	`, productID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var reviews []models.ProductReview
	for rows.Next() {
		var rev models.ProductReview
		if err := rows.Scan(
			&rev.ID, &rev.ProductID, &rev.UserID, &rev.Rating, &rev.Title, &rev.Comment, &rev.CreatedAt, &rev.UpdatedAt,
			&rev.UserFullName, &rev.UserAvatarURL,
		); err != nil {
			return nil, err
		}
		reviews = append(reviews, rev)
	}
	if reviews == nil {
		reviews = []models.ProductReview{}
	}
	return reviews, nil
}
