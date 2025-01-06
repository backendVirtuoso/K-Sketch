import React from "react";
import styled from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInstagram, faFacebook } from "@fortawesome/free-brands-svg-icons";

const FooterWrapper = styled.div`
    background-color: #333; /* 진한 색으로 변경 */
    color: #f1f1f1;
    padding: 20px 40px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    box-sizing: border-box;
    position: absolute;
    bottom: 0;
    height: 120px;
`;

const FooterSection = styled.div`
    display: flex;
    flex-direction: column;
`;

const FooterText = styled.p`
    margin: 0;
    font-size: 14px;
    line-height: 1.5;
    color: #d3d0cb;
`;

const FooterIcons = styled.div`
    display: flex;
    gap: 15px;
`;

const FooterA = styled.a`
    font-size: 16px;
    color: #f1f1f1;
    text-decoration: none;
    font-weight: bold;

    &:hover {
        color: #c0c0c0;
        text-decoration: underline;
    }
`;

const IconLink = styled.a`
    color: #f1f1f1;
    font-size: 24px;
    transition: color 0.3s;

    &:hover {
        color: #c0c0c0;
    }
`;

const Footer = () => {
    return (
        <FooterWrapper>
            <FooterSection>
                <FooterText>팀원</FooterText>
                <FooterText>주소</FooterText>
            </FooterSection>

            <FooterIcons>
                <IconLink href="https://www.instagram.com/">
                    <FontAwesomeIcon icon={faInstagram} />
                </IconLink>
                <IconLink href="https://www.facebook.com/">
                    <FontAwesomeIcon icon={faFacebook} />
                </IconLink>
            </FooterIcons>

            <FooterA href="/">국내천국</FooterA>
        </FooterWrapper>
    );
};

export default Footer;
