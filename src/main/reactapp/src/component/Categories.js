import React from "react";
import styled from "styled-components";

const CategoryWrapper = styled.div`
  justify-content: center;
  display: flex;
  flex-wrap: wrap;
  padding: 10px;
`;

const Category = styled.div`
  text-align: center;
  margin: 5px;
  background-color: #cfccd6;
  padding: 10px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1rem;

  &:hover {
    background-color: #79beee;
    color: white;
  }

  &:first-child {
    margin-left: 10px;
  }

  @media (max-width: 768px) {
    font-size: 10px;
    padding: 8px;
    margin: 5px;
  }

  @media (max-width: 480px) {
    font-size: 8px;
    padding: 6px;
    margin: 4px;
  }
`;

const Categories = ({ categories, onClick }) => {
  return (
    <CategoryWrapper>
      {categories.map((category, i) => (
        <Category key={category.rnum} onClick={() => onClick(category)}>
          {category.name}
        </Category>
      ))}
    </CategoryWrapper>
  );
};

export default Categories;
