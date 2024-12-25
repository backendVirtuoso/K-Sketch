import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './scss/AdminUserList.scss';

export default function AdminUserManagement() {
    const [users, setUsers] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const usersPerPage = 10;

    useEffect(() => {
        const token = localStorage.getItem("token");

        axios
            .get("http://localhost:8080/api/admin/users", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
            .then((response) => {
                setUsers(response.data);
            })
            .catch((err) => {
                console.error("사용자 정보 요청 실패:", err);
            });
    }, []);

    // 페이지네이션 관련 계산
    const totalPages = Math.ceil(users.length / usersPerPage);
    const startIndex = (currentPage - 1) * usersPerPage;
    const currentUsers = users.slice(startIndex, startIndex + usersPerPage);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    return (
        <div id='userList'>
            <div className="container mt-5">
                <div className="title">
                    <h3>회원목록</h3>
                    <div className="location">
                        <span><a href="!#">HOME</a><img src="./images/sign/signup/bg_arrow_01.webp" alt="" /></span>
                        <strong>회원목록</strong>
                    </div>
                </div>
                <div className="table-responsive">
                    <table className="table table-striped table-bordered text-center">
                        <thead className="thead-dark">
                            <tr>
                                <th>아이디</th>
                                <th>이름</th>
                                <th>휴대폰 번호</th>
                                <th>생년월일</th>
                                <th>수정</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentUsers.length > 0 ? (
                                currentUsers.map((user, index) => (
                                    <tr key={index}>
                                        <td>{user.loginId}</td>
                                        <td>{user.name}</td>
                                        <td>{user.phoneNumber}</td>
                                        <td>{user.birth}</td>
                                        <td>
                                            <Link
                                                to={`/admin/edit/${user.loginId}`}
                                                className="btn btn-sm btn-warning"
                                            >
                                                수정
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="text-center">사용자가 없습니다.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                {/* Bootstrap 페이지네이션 */}
                {totalPages > 1 && (
                    <nav>
                        <ul className="pagination justify-content-center">
                            {[...Array(totalPages)].map((_, index) => (
                                <li
                                    key={index}
                                    className={`page-item ${currentPage === index + 1 ? "active" : ""}`}
                                >
                                    <button
                                        className="page-link"
                                        onClick={() => handlePageChange(index + 1)}
                                    >
                                        {index + 1}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </nav>
                )}
            </div>
        </div>
    );
}
