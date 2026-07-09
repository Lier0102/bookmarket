package com.asdf.bookmarket.service;

import com.asdf.bookmarket.dto.request.CartItemRequest;
import com.asdf.bookmarket.dto.response.CartResponse;
import com.asdf.bookmarket.entity.Book;
import com.asdf.bookmarket.entity.Cart;
import com.asdf.bookmarket.entity.CartItem;
import com.asdf.bookmarket.entity.Member;
import com.asdf.bookmarket.exception.BusinessException;
import com.asdf.bookmarket.exception.ErrorCode;
import com.asdf.bookmarket.repository.CartItemRepository;
import com.asdf.bookmarket.repository.CartRepository;
import com.asdf.bookmarket.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.util.Optional;

// 회원별 장바구니 담기/수정/삭제 규칙 처리함.
@Slf4j
@Service
@Transactional
@RequiredArgsConstructor
public class CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final MemberService memberService;
    private final BookService bookService;

    @Transactional
    public CartResponse getMyCart(String memberId) {
        Member member = memberService.findMemberByMemberId(memberId);

        Cart cart = cartRepository.findByMemberWithItems(member)
                .orElseGet(()->{
                    Cart newCart = Cart.createCart(member);
                    return cartRepository.save(newCart);
                });
        return CartResponse.from(cart);
    }

    @Transactional
    public CartResponse addCartItem(String memberId,CartItemRequest request) {
        Member member = memberService.findMemberByMemberId(memberId);

        Book book = bookService.findBookById(request.getBookId());
        if (book.getUnitsInStock() < request.getQuantity()) {
            throw new BusinessException(ErrorCode.BOOK_OUT_OUF_STOCK);
        }

        Cart cart = cartRepository.findByMemberWithItems(member)
                .orElseGet(() -> cartRepository.save(Cart.createCart(member)));

        Optional<CartItem> existing = cartItemRepository.findByCartAndBook_bookId(cart, book.getBookId());
        if (existing.isPresent()) {
            CartItem item = existing.get();
            item.setQuantity(item.getQuantity() + request.getQuantity());
        } else {
            CartItem newItem = CartItem.createCartItem(cart, book, request.getQuantity());
            cart.getCartItems().add(newItem);
        }

        cart.updateGrandTotal();
        cartRepository.save(cart);

        log.info("Cart item added to cart");
        return CartResponse.from(cart);
    }

    @Transactional
    public CartResponse updateCartItem(String memberId,Long cartItemId, int quantity) {
        if (quantity < 1) {
            throw new BusinessException(ErrorCode.INVALID_INPUT_VALUE, "quantity must be greater than zero");
        }

        CartItem cartItem = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new BusinessException(ErrorCode.CART_ITEM_NOT_FOUND, "cartItemId not found"));

        if (!cartItem.getCart().getMember().getUsername().equals(memberId)) { // unauthorized 처리
            throw new BusinessException(ErrorCode.FORBIDDEN);
        }

        cartItem.updateQuantity(quantity);

        Cart cart = cartItem.getCart();
        cart.updateGrandTotal();

        cartRepository.save(cart);

        return CartResponse.from(cart);
    }

    @Transactional
    public CartResponse removeCartItem(String memberId,Long cartItemId) {
        CartItem cartItem = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new BusinessException(ErrorCode.CART_ITEM_NOT_FOUND));

        if (!cartItem.getCart().getMember().getUsername().equals(memberId)) {
            throw new BusinessException(ErrorCode.FORBIDDEN);
        }

        Cart cart = cartItem.getCart();
        cart.getCartItems().remove(cartItem);
        cart.updateGrandTotal();
        cartRepository.save(cart);

        log.info("Cart item removed from cart");
        return CartResponse.from(cart);
    }

    @Transactional
    public void clearCart(String memberId) {
        Member member = memberService.findMemberByMemberId(memberId);

        Cart cart = cartRepository.findByMember(member)
                .orElseThrow(() -> new BusinessException(ErrorCode.CART_NOT_FOUND));

        cart.getCartItems().clear();
        cart.updateGrandTotal();

        cartRepository.save(cart);

        log.info("cart was cleared");
    }

    @Transactional
    public void clearCartAfterOrder(Member member) {
        cartRepository.findByMember(member).ifPresent(cart -> {
            cart.getCartItems().clear();
            cart.updateGrandTotal();
            cartRepository.save(cart);
        });
    }

    @Transactional
    public Cart getCartForOrder(Member member) {
        Cart cart = cartRepository.findByMemberWithItems(member)
                .orElseThrow(() -> new BusinessException(ErrorCode.CART_NOT_FOUND));

        if (cart.getCartItems().isEmpty()) {
            throw new BusinessException(ErrorCode.CART_EMPTY);
        }

        return cart;
    }
}
