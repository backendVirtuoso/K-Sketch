import React from 'react'
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import "./SearchForm.style.css"

const SearchForm = () => {
  return (
    <div>
      <Form className="d-flex">
        <Form.Control
          type="search"
          placeholder="Search"
          className="me-2 searchform-layout searchform-searchform"
          aria-label="Search"
        />
        <Button variant="outline-info" className="searchform-layout">Search</Button>
      </Form>
    </div>
  )
}

export default SearchForm