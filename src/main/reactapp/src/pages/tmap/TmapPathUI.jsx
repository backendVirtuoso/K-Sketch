import React from 'react';

const TmapPathUI = ({
    mapRef,
    keyword,
    setKeyword,
    searchType,
    setSearchType,
    pathType,
    setPathType,
    handleSearch,
    searchRoute,
    results,
    handleSelectLocation,
    startPoint,
    endPoint,
    viaPoints,
    routeResult,
    transitDetails
}) => {
    return (
        <div style={{
            position: 'relative',
            width: '100vw',
            height: '100vh'
        }}>
            <div
                className="flex-grow"
                id="map_div"
                ref={mapRef}
                style={{
                    width: '100%',
                    height: '100%',
                    position: 'absolute',
                    top: 0,
                    left: 0
                }}
            />

            <div style={{
                position: 'absolute',
                top: '10px',
                left: '10px',
                width: '400px',
                maxHeight: 'calc(100vh - 40px)',
                backgroundColor: 'white',
                borderRadius: '8px',
                boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                zIndex: 1000,
                display: 'flex',
                flexDirection: 'column'
            }}>
                <div className="p-3">
                    <div className="btn-group w-100 mb-2">
                        <button
                            onClick={() => setSearchType('start')}
                            className={`btn btn-sm ${searchType === 'start' ? 'btn-primary' : 'btn-outline-primary'}`}
                        >
                            <i className="bi bi-geo-alt-fill me-1"></i>출발
                        </button>
                        <button
                            onClick={() => setSearchType('via')}
                            className={`btn btn-sm ${searchType === 'via' ? 'btn-primary' : 'btn-outline-primary'}`}
                        >
                            <i className="bi bi-geo-alt me-1"></i>경유지
                        </button>
                        <button
                            onClick={() => setSearchType('end')}
                            className={`btn btn-sm ${searchType === 'end' ? 'btn-primary' : 'btn-outline-primary'}`}
                        >
                            <i className="bi bi-geo-alt me-1"></i>도착
                        </button>
                    </div>

                    <div className="input-group input-group-sm mb-2">
                        <input
                            type="text"
                            className="form-control"
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            placeholder="주소 또는 장소 검색"
                        />
                        <button className="btn btn-primary" onClick={handleSearch}>
                            <i className="bi bi-search"></i>
                        </button>
                    </div>

                    <div className="d-flex gap-1">
                        <select
                            className="form-select form-select-sm"
                            value={pathType}
                            onChange={(e) => setPathType(e.target.value)}
                        >
                            <option value="pedestrian">보행자</option>
                            <option value="car">자동차</option>
                            <option value="transit">대중교통</option>
                        </select>
                        <button className="btn btn-primary btn-sm" onClick={searchRoute}>
                            <i className="bi bi-signpost-2"></i>
                        </button>
                    </div>

                    <div className="bg-light p-2 rounded mt-2">
                        <div className="small mb-2">
                            <i className="bi bi-geo-alt-fill text-primary me-1"></i>
                            <span className="fw-bold">출발:</span>
                            <div className="text-truncate">{startPoint?.name || '선택되지 않음'}</div>
                        </div>
                        <div className="small mb-2">
                            <i className="bi bi-geo-alt text-primary me-1"></i>
                            <span className="fw-bold">경유지:</span>
                            <div className="text-truncate">{viaPoints.length > 0 ? viaPoints.map(v => v.name).join(', ') : '선택되지 않음'}</div>
                        </div>
                        <div className="small">
                            <i className="bi bi-geo-alt-fill text-primary me-1"></i>
                            <span className="fw-bold">도착:</span>
                            <div className="text-truncate">{endPoint?.name || '선택되지 않음'}</div>
                        </div>
                    </div>

                    {routeResult && (
                        <div className="alert alert-info mt-2 py-1 small mb-0">
                            <i className="bi bi-info-circle me-1"></i>{routeResult}
                        </div>
                    )}
                </div>

                <div style={{
                    maxHeight: '50vh',
                    overflowY: 'hidden',
                    borderTop: results.length > 0 ? '1px solid #dee2e6' : 'none'
                }}>
                    {results.length > 0 && (
                        <div className="list-group list-group-flush">
                            {results.map((result, index) => (
                                <button
                                    key={index}
                                    className="list-group-item list-group-item-action py-2"
                                    onClick={() => handleSelectLocation(result)}
                                    style={{
                                        border: '1px solid #dee2e6',
                                        borderRadius: '5px',
                                        marginBottom: '5px',
                                        backgroundColor: '#f8f9fa',
                                        transition: 'background-color 0.3s'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e9ecef'}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                                >
                                    <div className="fw-bold">{result.name}</div>
                                    {result.type === 'poi' && (
                                        <small className="text-muted d-block">{result.address}</small>
                                    )}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {transitDetails && pathType === 'transit' && (
                    <div className="border-top p-3" style={{ overflowY: 'auto', maxHeight: '50vh', scrollbarWidth: 'none' }}>
                        <h6 className="mb-2">경로 상세 정보</h6>
                        <div className="transit-details">
                            {transitDetails.map((detail, index) => (
                                <div key={index} className="transit-step mb-2">
                                    {detail.mode === 'WALK' ? (
                                        <div className="d-flex align-items-center">
                                            <i className="bi bi-person-walking me-2"></i>
                                            <div>
                                                <div>도보 {detail.sectionTime}분</div>
                                                <small className="text-muted">
                                                    {detail.start} → {detail.end} ({detail.distance}km)
                                                </small>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="d-flex align-items-center">
                                            <i className={`bi ${detail.mode === 'BUS' ? 'bi-bus-front' : 'bi-train-front'} me-2`}></i>
                                            <div>
                                                <div>{detail.routeName || detail.routeNumber}</div>
                                                <small className="text-muted">
                                                    {detail.start} → {detail.end} ({detail.sectionTime}분)
                                                </small>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TmapPathUI;