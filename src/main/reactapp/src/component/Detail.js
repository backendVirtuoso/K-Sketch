import React from "react";
import styled from "styled-components";
import logo from "../logo3.png";
import { Button } from "react-bootstrap";

const ModalBackground = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1001;
`;

const ModalContent = styled.div`
    position: relative;
    background: white;
    padding: 20px;
    border-radius: 8px;
    max-width: 600px;
    width: 100%;
`;

const CloseButton = styled.button`
    top: 5px;
    right: 5px;
    background: none;
    border: none;
    position: absolute;
    font-size: 1.5rem;

    cursor: pointer;

    &:hover {
        background-color: red;
        color: white;
        border-radius: 5px;
    }
`;

const Detail = ({ data, onClose, setModal, setShowCardDetail }) => {
    const registerButton = () => {
        setShowCardDetail(true);
        setModal(false);
    };

    if (!data) return null;

    return (
        <>
            <ModalBackground onClick={onClose}>
                <ModalContent onClick={(e) => e.stopPropagation()}>
                    <CloseButton onClick={onClose}>×</CloseButton>
                    <h2>{data.title}</h2>
                    {data.firstimage ? (
                        <img src={data.firstimage} alt={data.title}
                            style={{ maxWidth: "100%", height: "500px", width: "100%" }} />
                    ) : (
                        <img src={logo} alt='로고' style={{ maxWidth: "100%", height: "500px", width: "100%" }} />
                    )}
                    <p>{data.addr1}</p>
                    <p>{data.addr2}</p>
                    <Button onClick={() => window.open(`https://map.naver.com/p/search/${encodeURIComponent(data.addr1)}`, "_blank")}>위치</Button>
                </ModalContent>
            </ModalBackground>
        </>
    );
};

export default Detail;
