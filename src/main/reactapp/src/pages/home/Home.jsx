import React from "react";
import Banner from "./banner/Banner";
import SearchForm from "./SearchForm";
import "./Home.style.css";
import RandomTravel from "./components/randompage/RandomTravel";
import GotoLink from "./components/gotoLink/GotoLink";
import MenuList from "../../component/MenuList";
import Footer from "../../component/Footer";

const Home = () => {
  return (
    <div className='main-page'>
      <div>
        <Banner />
      </div>
      <div className='home-searchform'>
        <SearchForm />
      </div>
      <div>
        <RandomTravel />
      </div>
      <div>
        <GotoLink />
      </div>

      <div className='menu-list'>
        <MenuList />
      </div>

      <div className='footer mt-3'>
        <Footer />
      </div>
    </div>
  );
};

export default Home;
