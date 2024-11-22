import Card from "react-bootstrap/Card";
import styled from "styled-components";

const CardWrapper = styled.div`
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

const CardDetail = ({ data, logo }) => {
  console.log(data);

  return (
    <CardWrapper>
      <Card style={{ width: "300px", margin: "0 auto", marginBottom: "50px" }}>
        <Card.Img variant='top' src={data.firstimage ? data.firstimage : logo} />
        <Card.Body>
          <Card.Title>{data.title}</Card.Title>
          <Card.Text>{data.addr1}</Card.Text>
        </Card.Body>
      </Card>
    </CardWrapper>
  );
};

export default CardDetail;
