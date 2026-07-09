package com.example.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.backend.entity.Product;

public interface ProductRepository extends JpaRepository<Product, Integer> {

  @Query("""
          SELECT p FROM Product p
          WHERE p.name LIKE %:keyword%
             OR p.slug LIKE %:keyword%
      """)
  Page<Product> search(@Param("keyword") String keyword, Pageable pageable);

  @Query("""
          SELECT p FROM Product p
          WHERE (:keyword IS NULL OR p.name LIKE %:keyword% OR p.slug LIKE %:keyword%)
            AND (:categoryIds IS NULL OR p.category.id IN :categoryIds)
            AND (:brandIds IS NULL OR p.brand.id IN :brandIds)
            AND (:status IS NULL OR p.status = :status)
            AND (:minPrice IS NULL OR p.salePrice >= :minPrice)
            AND (:maxPrice IS NULL OR p.salePrice <= :maxPrice)
            AND (:hasPromotion IS NULL
                 OR (:hasPromotion = true AND p.discountPrice > 0 AND p.discountPrice < p.salePrice)
                 OR (:hasPromotion = false AND (p.discountPrice IS NULL OR p.discountPrice = 0 OR p.discountPrice >= p.salePrice)))
      """)
  Page<Product> filter(
      @Param("keyword") String keyword,
      @Param("categoryIds") List<Integer> categoryIds,
      @Param("brandIds") List<Integer> brandIds,
      @Param("status") Integer status,
      @Param("minPrice") java.math.BigDecimal minPrice,
      @Param("maxPrice") java.math.BigDecimal maxPrice,
      @Param("hasPromotion") Boolean hasPromotion,
      Pageable pageable);

  // ✅ Đếm số sản phẩm theo category (để validate khi xóa)
  long countByCategoryId(Integer categoryId);

  // ✅ Check slug tồn tại
  boolean existsBySlug(String slug);

  boolean existsBySlugAndIdNot(String slug, Integer id);

  // ✅ Đếm sản phẩm theo Brand để validate delete
  long countByBrandId(Integer brandId);

  // ✅ Check tên sản phẩm tồn tại
  boolean existsByName(String name);

  boolean existsByNameAndIdNot(String name, Integer id);

  // 6 sản phẩm mới nhất
  @Query("""
        SELECT p FROM Product p
        WHERE p.status = 1
          AND (
               (p.saleType = 'UNIT' AND p.qty > 0)
            OR (p.saleType = 'WEIGHT' AND p.qty >= 1000)
          )
        ORDER BY p.createdAt DESC
      """)
  List<Product> findLatestProducts(Pageable pageable);

  // Tìm sản phẩm theo slug
  Optional<Product> findBySlug(String slug);

  // 4 sản phẩm liên quan (cùng category, loại trừ sản phẩm hiện tại)
  @Query("""
          SELECT p FROM Product p
          WHERE p.category.id = :categoryId
            AND p.id <> :productId
            AND p.status = 1
          ORDER BY p.id DESC
      """)
  List<Product> findRelatedProducts(
      @Param("categoryId") Integer categoryId,
      @Param("productId") Integer productId,
      Pageable pageable);

  @Query("""
          SELECT p FROM Product p
          WHERE (:query IS NULL OR :query = '' OR p.name LIKE %:query% OR p.category.name LIKE %:query%)
            AND (:minPrice IS NULL OR p.salePrice >= :minPrice)
            AND (:maxPrice IS NULL OR p.salePrice <= :maxPrice)
            AND p.status = 1
      """)
  List<Product> searchForAi(
      @Param("query") String query,
      @Param("minPrice") java.math.BigDecimal minPrice,
      @Param("maxPrice") java.math.BigDecimal maxPrice,
      Pageable pageable);

}
