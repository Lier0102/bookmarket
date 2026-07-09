package com.asdf.bookmarket.service;

import com.asdf.bookmarket.dto.request.OrderCreateRequest;
import com.asdf.bookmarket.dto.request.OrderUpdateRequest;
import com.asdf.bookmarket.dto.response.OrderResponse;
import com.asdf.bookmarket.dto.response.PageResponse;
import com.asdf.bookmarket.entity.Book;
import com.asdf.bookmarket.entity.Cart;
import com.asdf.bookmarket.entity.CartItem;
import com.asdf.bookmarket.entity.Member;
import com.asdf.bookmarket.entity.Order;
import com.asdf.bookmarket.entity.OrderItem;
import com.asdf.bookmarket.exception.BusinessException;
import com.asdf.bookmarket.exception.ErrorCode;
import com.asdf.bookmarket.repository.BookRepository;
import com.asdf.bookmarket.repository.MemberRepository;
import com.asdf.bookmarket.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

// 장바구니 기반 주문 생성/조회/수정/취소 규칙 처리함.
@Service
@Transactional
@Slf4j
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final BookRepository bookRepository;
    private final MemberService memberService;
    private final CartService cartService;

    @Transactional
    public OrderResponse createOrder(String memberId, OrderCreateRequest request) {
        Member member = memberService.findMemberByMemberId(memberId);

        Cart cart = cartService.getCartForOrder(member);

        Order order = Order.builder()
                .member(member)
                .customerName(request.getCustomerName())
                .customerPhone(request.getCustomerPhone())
                .customerAddress(request.getCustomerAddress().toEntity())
                .shippingName(request.getShippingName())
                .shippingAddress(request.getShippingAddress().toEntity())
                .shippingDate(request.getShippingDate())
                .grandTotal(BigDecimal.ZERO)
                .build();

        List<OrderItem> orderItems = new ArrayList<>();
        BigDecimal total = BigDecimal.ZERO;

        for (CartItem cartItem : cart.getCartItems()) {
            Book book = cartItem.getBook();

            if (book.getUnitsInStock() < cartItem.getQuantity()) {
                throw new BusinessException(ErrorCode.BOOK_OUT_OUF_STOCK,
                        "'" + book.getName() + "' 도서 재고 부족");
            }

            book.setUnitsInStock(book.getUnitsInStock() - cartItem.getQuantity());
            bookRepository.save(book);

            OrderItem orderItem = OrderItem.createOrderItem(order, book, cartItem.getQuantity());
            orderItems.add(orderItem);
            total = total.add(cartItem.getTotalPrice());
        }

        order.getOrderItems().addAll(orderItems);
        order.setGrandTotal(total);

        Order savedOrder = orderRepository.save(order);
        cartService.clearCartAfterOrder(member);
        log.info("Order completed: {}", savedOrder);

        return OrderResponse.from(savedOrder);
    }

    @Transactional(readOnly = true)
    public PageResponse<OrderResponse> getMyOrders(String memberId, int page, int size, String sortField, String sortDir) {
        Member member = memberService.findMemberByMemberId(memberId);

        Sort sort = sortDir.equalsIgnoreCase("desc")
                ? Sort.by(sortField).descending()
                : Sort.by(sortField).ascending();

        Pageable pageable = PageRequest.of(page, size, sort);
        Page<OrderResponse> orderPage = orderRepository.findByMember(member, pageable).map(OrderResponse::from);

        return PageResponse.of(orderPage);
    }

    @Transactional(readOnly = true)
    public OrderResponse getMyOrder(String memberId, Long orderId) {
        Member member = memberService.findMemberByMemberId(memberId);

        Order order = orderRepository.findByOrderIdAndMember(orderId, member)
                .orElseThrow(() -> new BusinessException(ErrorCode.ORDER_NOT_FOUND));

        return OrderResponse.from(order);
    }

    @Transactional(readOnly = true)
    public PageResponse<OrderResponse> getAllOrders(int page, int size, String sortField, String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase("desc")
                ? Sort.by(sortField).descending()
                : Sort.by(sortField).ascending();

        Pageable pageable = PageRequest.of(page, size, sort);
        Page<OrderResponse> orderPage = orderRepository.findAll(pageable).map(OrderResponse::from);

        return PageResponse.of(orderPage);
    }

    @Transactional(readOnly = true)
    public OrderResponse getOrderById(Long orderId) {
        Order order = orderRepository.findById(orderId).orElseThrow(() -> new BusinessException(ErrorCode.ORDER_NOT_FOUND));

        return OrderResponse.from(order);
    }

    @Transactional
    public OrderResponse updateOrder(Long orderId, OrderUpdateRequest request) {
        Order order = orderRepository.findById(orderId).orElseThrow(() -> new BusinessException(ErrorCode.ORDER_NOT_FOUND));

        if (request.getShippingAddress() != null) {
            order.setShippingAddress(request.getShippingAddress().toEntity());
        }

        if (request.getShippingName() != null) {
            order.setShippingName(request.getShippingName());
        }

        if (request.getShippingDate() != null) {
            order.setShippingDate(request.getShippingDate());
        }

        log.info("Order updated: {}", order);

        return OrderResponse.from(order);
    }

    @Transactional
    public void deleteOrder(Long orderId) {
        Order order = orderRepository.findById(orderId).orElseThrow(() -> new BusinessException(ErrorCode.ORDER_NOT_FOUND));
        orderRepository.delete(order);

        log.info("Order deleted: {}", order);
    }

    @Transactional
    public void deleteAllOrders() {
        orderRepository.deleteAll();
        log.info("All orders deleted. Was that a mistake? well, there's no features like rewind.");
    }
}
