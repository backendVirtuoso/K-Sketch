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
  background-color: ${(props) => (props.isSelected ? "#79beee" : "#cfccd6")};
  color: ${(props) => (props.isSelected ? "white" : "black")};
  padding: 10px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.3s, color 0.3s;

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

const Categories = ({ categories, selectedCategory, onClick }) => {
  return (
    <CategoryWrapper>
      {categories.map((category) => (
        <Category
          key={category.rnum}
          isSelected={
            selectedCategory && selectedCategory.rnum === category.rnum
          }
          onClick={() => onClick(category)}
        >
          {category.name}
        </Category>
      ))}
    </CategoryWrapper>
  );
};

export default Categories;
