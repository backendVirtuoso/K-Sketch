import React, { useState } from "react";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import "./SearchForm.style.css";
import { useNavigate } from "react-router-dom";

const SearchForm = () => {
  const [keyword, setKeyword] = useState("");
  const navigate = useNavigate();
  const searchByKeyword = (event) => {
    event.preventDefault();
    navigate(`/travelwith?q=${keyword}`);
  };

  return (
    <div>
      <Form className="d-flex" onSubmit={searchByKeyword}>
        <Form.Control
          type="search"
          placeholder="검색"
          className="me-2 searchform-layout searchform-searchform"
          aria-label="Search"
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
        />
        <Button
          variant="outline-info"
          className="searchform-layout"
          type="submit"
        >
        검색
        </Button>
      </Form>
    </div>
  );
};

export default SearchForm;
