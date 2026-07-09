import { Link } from "react-router-dom";
import "./Footer.css";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__top">
          <div>
            <div className="footer__brand">북마켓</div>
            <p className="footer__tagline">
              책은 무료예요! 마음껏 읽어주세요!!
            </p>
          </div>
          <div className="footer__columns">
            <div className="footer__col">
              <h4>Shop</h4>
              <Link to="/books">전체 도서</Link>
              <Link to="/cart">장바구니</Link>
              <Link to="/board">커뮤니티</Link>
            </div>
            <div className="footer__col">
              <h4>Account</h4>
              <Link to="/mypage">마이페이지</Link>
              <Link to="/login">로그인</Link>
              <Link to="/signup">회원가입</Link>
            </div>
          </div>
        </div>
        <div className="footer__bottom">
          <span>
            &copy; {new Date().getFullYear()} 북마켓. All rights reserved.
          </span>
          <span>데카르트 명언 보고 만듦ㅋ.</span>
        </div>
      </div>
    </footer>
  );
}
