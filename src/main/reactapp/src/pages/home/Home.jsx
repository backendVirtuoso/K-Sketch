import React, { useRef } from "react";
import Banner from "./banner/Banner";
import SearchForm from "./SearchForm";
import "./Home.style.css";
import RandomTravel from "./components/randompage/RandomTravel";
import GotoLink from "./components/gotoLink/GotoLink";
import MenuList from "../../component/MenuList";
import Footer from "../../component/Footer";
import { CiCircleChevUp } from "react-icons/ci";

const Home = () => {
  const topRef = useRef(null);

  // 스크롤 맨 위로 이동하는 함수
  const scrollToTop = () => {
    if (topRef.current) {
      topRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div>
      <div ref={topRef} className="main-page">
        <div>
          <Banner />
        </div>
        <div className="home-searchform">
          <SearchForm />
        </div>
        <div>
          <RandomTravel />
        </div>
        <div>
          <GotoLink />
        </div>

        <div style={{ position: "relative", minHeight: "100vh" }}>
          <div style={{ paddingBottom: "100px" }}>
            <MenuList />
            <Footer />
          </div>
        </div>
      </div>

      {/* 위로 가는 버튼 */}
      <div className="scroll-to-top" onClick={scrollToTop}>
        <CiCircleChevUp size={30} />
      </div>
    </div>
  );
};

export default Home;
