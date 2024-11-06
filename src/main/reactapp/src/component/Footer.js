import React from "react";
import styled from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInstagram, faFacebook } from "@fortawesome/free-brands-svg-icons";

const FooterWrapper = styled.div`
  background-color: #d3d0cb;
  color: white;
  padding: 40px 20px;
  position: fixed; /* 화면에 고정 */
  bottom: 0; /* 화면의 맨 아래에 위치 */
  width: 100%;
  height: 150px;
  box-sizing: border-box;
  z-index: 1000; /* 다른 요소보다 위에 표시되도록 */

  a {
    color: white;
    text-decoration: none;
    font-weight: bold;
  }

  a:hover {
    text-decoration: underline;
  }
`;

const FooterIcons = styled.div`
  position: absolute;
  left: 20px;
  bottom: 20px;
`;

const FooterP = styled.div`
  position: absolute;
  top: 20px;
  left: 20px;
  p {
    margin: 5px 0;
    font-size: 14px;
    line-height: 1.5;
  }
`;

const FooterA = styled.div`
  position: absolute;
  bottom: 20px;
  right: 20px;
  font-size: 16px;
`;

const Footer = () => {
  return (
    <FooterWrapper>
      <FooterP>
        <p>팀원</p>
        <p>주소</p>
      </FooterP>
      <FooterIcons>
        <a href="https://www.instagram.com/sem/campaign/emailsignup/?campaign_id=13530338586&extra_1=s%7Cc%7C547419126431%7Ce%7Cinstagram%20%27%7C&placement=&creative=547419126431&keyword=instagram%20%27&partner_id=googlesem&extra_2=campaignid%3D13530338586%26adgroupid%3D126262418054%26matchtype%3De%26network%3Dg%26source%3Dnotmobile%26search_or_content%3Ds%26device%3Dc%26devicemodel%3D%26adposition%3D%26target%3D%26targetid%3Dkwd-1321618851291%26loc_physical_ms%3D9197620%26loc_interest_ms%3D%26feeditemid%3D%26param1%3D%26param2%3D&gad_source=1&gclid=Cj0KCQjwj4K5BhDYARIsAD1Ly2rkDEyZPR6Q80_0PyT4qyQPOZR_Xloz_Bm8gKAGPVm98EtTBaLihVcaAvBmEALw_wcB">
          <FontAwesomeIcon
            icon={faInstagram}
            style={{ fontSize: "30px", marginRight: "10px" }}
          />
        </a>
        <a href="https://www.facebook.com/?gad_source=1&gclid=Cj0KCQjwj4K5BhDYARIsAD1Ly2oRalrcVQ8NieAkQ6ZvmCkwfD4JlpR-h523cFJK46rzRJHUKrwHxIsaAneGEALw_wcB">
          <FontAwesomeIcon icon={faFacebook} style={{ fontSize: "30px" }} />
        </a>
      </FooterIcons>
      <FooterA>
        <a href="/">국내천국</a>
      </FooterA>
    </FooterWrapper>
  );
};

export default Footer;
