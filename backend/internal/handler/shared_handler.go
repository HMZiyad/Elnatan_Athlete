package handler

import (
	"crypto/rand"
	"fmt"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
	"github.com/uag/backend/internal/models"
	"github.com/uag/backend/internal/repository"
	"github.com/uag/backend/internal/utils"
)

// AddressHandler handles shared address book endpoints for both fans and athletes.
type AddressHandler struct {
	userRepo *repository.UserRepository
}

func NewAddressHandler(userRepo *repository.UserRepository) *AddressHandler {
	return &AddressHandler{userRepo: userRepo}
}

func (h *AddressHandler) List(w http.ResponseWriter, r *http.Request) {
	userID := getUID(r)
	addresses, err := h.userRepo.ListAddresses(r.Context(), userID)
	if err != nil {
		utils.InternalError(w)
		return
	}
	if addresses == nil {
		addresses = []models.Address{}
	}
	utils.Success(w, addresses)
}

func (h *AddressHandler) Create(w http.ResponseWriter, r *http.Request) {
	userID := getUID(r)
	var req struct {
		Label     string `json:"label" validate:"required"`
		FullName  string `json:"full_name" validate:"required"`
		Street    string `json:"street" validate:"required"`
		City      string `json:"city" validate:"required"`
		State     string `json:"state"`
		Zip       string `json:"zip" validate:"required"`
		Country   string `json:"country"`
		Phone     string `json:"phone"`
		IsDefault bool   `json:"is_default"`
	}
	if err := utils.Decode(r, &req); err != nil {
		utils.BadRequest(w, "VALIDATION_ERROR", "Invalid body")
		return
	}
	if err := utils.Validate(req); err != nil {
		utils.BadRequest(w, "VALIDATION_ERROR", err.Error())
		return
	}
	if req.Country == "" {
		req.Country = "US"
	}

	a := &models.Address{
		UserID:    userID,
		Label:     req.Label,
		FullName:  req.FullName,
		Street:    req.Street,
		City:      req.City,
		Zip:       req.Zip,
		Country:   req.Country,
		IsDefault: req.IsDefault,
	}
	if req.State != "" {
		a.State = &req.State
	}
	if req.Phone != "" {
		a.Phone = &req.Phone
	}

	if err := h.userRepo.CreateAddress(r.Context(), a); err != nil {
		utils.InternalError(w)
		return
	}

	utils.Created(w, map[string]interface{}{"id": a.ID, "message": "Address added."})
}

func (h *AddressHandler) Update(w http.ResponseWriter, r *http.Request) {
	userID := getUID(r)
	addressID, err := uuid.Parse(chi.URLParam(r, "address_id"))
	if err != nil {
		utils.BadRequest(w, "INVALID_ID", "Invalid address ID")
		return
	}

	var req struct {
		Label     string `json:"label"`
		FullName  string `json:"full_name"`
		Street    string `json:"street"`
		City      string `json:"city"`
		State     string `json:"state"`
		Zip       string `json:"zip"`
		Country   string `json:"country"`
		Phone     string `json:"phone"`
		IsDefault bool   `json:"is_default"`
	}
	if err := utils.Decode(r, &req); err != nil {
		utils.BadRequest(w, "VALIDATION_ERROR", "Invalid body")
		return
	}

	a := &models.Address{
		ID: addressID, UserID: userID,
		Label: req.Label, FullName: req.FullName, Street: req.Street,
		City: req.City, Zip: req.Zip, Country: req.Country, IsDefault: req.IsDefault,
	}
	if req.State != "" {
		a.State = &req.State
	}
	if req.Phone != "" {
		a.Phone = &req.Phone
	}

	if err := h.userRepo.UpdateAddress(r.Context(), a); err != nil {
		utils.InternalError(w)
		return
	}

	utils.Success(w, map[string]string{"message": "Address updated."})
}

func (h *AddressHandler) Delete(w http.ResponseWriter, r *http.Request) {
	userID := getUID(r)
	addressID, err := uuid.Parse(chi.URLParam(r, "address_id"))
	if err != nil {
		utils.BadRequest(w, "INVALID_ID", "Invalid address ID")
		return
	}

	if err := h.userRepo.DeleteAddress(r.Context(), addressID, userID); err != nil {
		utils.NotFound(w, "ADDRESS")
		return
	}

	utils.NoContent(w)
}

func (h *AddressHandler) SetDefault(w http.ResponseWriter, r *http.Request) {
	userID := getUID(r)
	addressID, err := uuid.Parse(chi.URLParam(r, "address_id"))
	if err != nil {
		utils.BadRequest(w, "INVALID_ID", "Invalid address ID")
		return
	}

	if err := h.userRepo.SetDefaultAddress(r.Context(), addressID, userID); err != nil {
		utils.NotFound(w, "ADDRESS")
		return
	}

	utils.Success(w, map[string]string{"message": "Default address updated."})
}

// ─── Payment Method Handler ───────────────────────────────────

type PaymentHandler struct {
	userRepo *repository.UserRepository
	orderSvc *orderServiceIface
}

type orderServiceIface interface {
	AttachPaymentMethod(ctx interface{}, userID uuid.UUID, stripePMID string) (*models.PaymentMethod, error)
	DetachPaymentMethod(ctx interface{}, pmID, userID uuid.UUID) error
}

// Simplified inline payment handler without interface indirection
type PaymentMethodHandler struct {
	userRepo *repository.UserRepository
	svc      interface {
		AttachPaymentMethod(ctx interface{}, userID uuid.UUID, stripePMID string) (*models.PaymentMethod, error)
		DetachPaymentMethod(ctx interface{}, pmID, userID uuid.UUID) error
	}
}

// ProductHandler handles public product listing endpoints.
type ProductHandler struct {
	productRepo *repository.ProductRepository
}

func NewProductHandler(productRepo *repository.ProductRepository) *ProductHandler {
	return &ProductHandler{productRepo: productRepo}
}

func (h *ProductHandler) List(w http.ResponseWriter, r *http.Request) {
	category := r.URL.Query().Get("category")
	search := r.URL.Query().Get("search")
	page := 1
	perPage := 20
	if p := r.URL.Query().Get("page"); p != "" {
		if n, err := fmt.Sscan(p, &page); n == 0 || err != nil {
			page = 1
		}
	}

	products, total, err := h.productRepo.List(r.Context(), category, search, page, perPage)
	if err != nil {
		utils.InternalError(w)
		return
	}
	utils.Paginated(w, products, page, perPage, total)
}

func (h *ProductHandler) Get(w http.ResponseWriter, r *http.Request) {
	productID, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		utils.BadRequest(w, "INVALID_ID", "Invalid product ID")
		return
	}

	p, err := h.productRepo.FindByID(r.Context(), productID)
	if err != nil {
		utils.NotFound(w, "PRODUCT")
		return
	}
	utils.Success(w, p)
}

// ─── Cart Handler ─────────────────────────────────────────────

type CartHandler struct {
	cartRepo    *repository.CartRepository
	productRepo *repository.ProductRepository
}

func NewCartHandler(cartRepo *repository.CartRepository, productRepo *repository.ProductRepository) *CartHandler {
	return &CartHandler{cartRepo: cartRepo, productRepo: productRepo}
}

func (h *CartHandler) Get(w http.ResponseWriter, r *http.Request) {
	userID := getUID(r)
	cart, err := h.cartRepo.GetOrCreate(r.Context(), userID)
	if err != nil {
		utils.InternalError(w)
		return
	}
	utils.Success(w, cart)
}

func (h *CartHandler) AddItem(w http.ResponseWriter, r *http.Request) {
	userID := getUID(r)
	var req struct {
		ProductID string `json:"product_id" validate:"required"`
		Size      string `json:"size"`
		Color     string `json:"color"`
		Quantity  int    `json:"quantity"`
	}
	if err := utils.Decode(r, &req); err != nil {
		utils.BadRequest(w, "VALIDATION_ERROR", "Invalid body")
		return
	}
	if req.Quantity < 1 {
		req.Quantity = 1
	}

	productID, err := uuid.Parse(req.ProductID)
	if err != nil {
		utils.BadRequest(w, "INVALID_ID", "Invalid product ID")
		return
	}

	p, err := h.productRepo.FindByID(r.Context(), productID)
	if err != nil {
		utils.NotFound(w, "PRODUCT")
		return
	}
	if p.Inventory < req.Quantity {
		utils.BadRequest(w, "OUT_OF_STOCK", "Insufficient stock")
		return
	}

	cart, _ := h.cartRepo.GetOrCreate(r.Context(), userID)
	item, err := h.cartRepo.AddItem(r.Context(), cart.ID, productID, req.Size, req.Color, p.Price, req.Quantity)
	if err != nil {
		utils.InternalError(w)
		return
	}

	utils.Created(w, map[string]interface{}{"cart_item_id": item.ID, "message": "Item added to cart."})
}

func (h *CartHandler) UpdateItem(w http.ResponseWriter, r *http.Request) {
	userID := getUID(r)
	itemID, err := uuid.Parse(chi.URLParam(r, "cart_item_id"))
	if err != nil {
		utils.BadRequest(w, "INVALID_ID", "Invalid cart item ID")
		return
	}

	var req struct {
		Quantity int `json:"quantity" validate:"required,min=1"`
	}
	if err := utils.Decode(r, &req); err != nil {
		utils.BadRequest(w, "VALIDATION_ERROR", "Invalid body")
		return
	}

	cart, _ := h.cartRepo.GetOrCreate(r.Context(), userID)
	if err := h.cartRepo.UpdateItemQuantity(r.Context(), itemID, cart.ID, req.Quantity); err != nil {
		utils.NotFound(w, "CART_ITEM")
		return
	}

	utils.Success(w, map[string]string{"message": "Cart item updated."})
}

func (h *CartHandler) RemoveItem(w http.ResponseWriter, r *http.Request) {
	userID := getUID(r)
	itemID, err := uuid.Parse(chi.URLParam(r, "cart_item_id"))
	if err != nil {
		utils.BadRequest(w, "INVALID_ID", "Invalid cart item ID")
		return
	}

	cart, _ := h.cartRepo.GetOrCreate(r.Context(), userID)
	_ = h.cartRepo.RemoveItem(r.Context(), itemID, cart.ID)

	utils.NoContent(w)
}

func (h *CartHandler) Clear(w http.ResponseWriter, r *http.Request) {
	userID := getUID(r)
	cart, _ := h.cartRepo.GetOrCreate(r.Context(), userID)
	_ = h.cartRepo.ClearCart(r.Context(), cart.ID)
	utils.NoContent(w)
}

// ─── Upload Handler ───────────────────────────────────────────

type UploadHandler struct {
	uploadDir string
	baseURL   string
}

func NewUploadHandler(uploadDir, baseURL string) *UploadHandler {
	return &UploadHandler{uploadDir: uploadDir, baseURL: baseURL}
}

func (h *UploadHandler) Upload(w http.ResponseWriter, r *http.Request) {
	if err := r.ParseMultipartForm(200 << 20); err != nil {
		utils.BadRequest(w, "PARSE_ERROR", "Failed to parse form data")
		return
	}

	file, header, err := r.FormFile("file")
	if err != nil {
		utils.BadRequest(w, "MISSING_FILE", "File field is required")
		return
	}
	defer file.Close()

	uploadTypeStr := r.FormValue("type")
	uploadType := utils.UploadType(uploadTypeStr)

	result, err := utils.SaveUpload(file, header, uploadType, h.uploadDir, h.baseURL)
	if err != nil {
		switch err.Error() {
		case "FILE_TOO_LARGE":
			utils.BadRequest(w, "FILE_TOO_LARGE", "File exceeds the maximum allowed size")
		case "UNSUPPORTED_FILE_TYPE":
			utils.BadRequest(w, "UNSUPPORTED_FILE_TYPE", "File format not allowed for this upload type")
		default:
			utils.InternalError(w)
		}
		return
	}

	utils.Created(w, result)
}

// ─── Stripe Webhook Handler ───────────────────────────────────

type StripeWebhookHandler struct {
	webhookSecret string
	orderSvc      interface {
		HandleStripeWebhook(ctx interface{}, intentID string, succeeded bool) error
	}
}

// ─── OTP helper (moved here to avoid import cycle) ────────────

func GenerateOTP() string {
	b := make([]byte, 3)
	if _, err := rand.Read(b); err != nil {
		return "000000"
	}
	// Produce a 6-digit number from 3 random bytes
	n := int(b[0])*10000 + int(b[1])*100 + int(b[2])
	return fmt.Sprintf("%06d", n%1000000)
}
