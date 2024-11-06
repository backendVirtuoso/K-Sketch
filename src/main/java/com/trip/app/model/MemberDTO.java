package com.trip.app.model;

import lombok.Data;
import java.sql.Date;

@Data
public class MemberDTO {
    private String loginId;
    private String password;
    private String name;
    private String phoneNumber;
    private String gender;
    private Date birth;
    private String role;

}
