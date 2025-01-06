import React, { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import "./scss/ScheduleEdit.scss";
import { PlaceSelector } from "./SchedulePlace";

const ScheduleEdit = ({ schedule, onSave, onCancel, drawDayRoute, clearAllRoutes }) => {
    const [editedSchedule, setEditedSchedule] = useState(schedule);
    const [selectedDayIndex, setSelectedDayIndex] = useState(0);
    const [showPlaceSelector, setShowPlaceSelector] = useState(false);

    // 드래그 앤 드롭 처리
    const handleDragEnd = (result) => {
        if (!result.destination) return;

        const { source, destination } = result;
        const daySchedule = { ...editedSchedule.days[selectedDayIndex] };
        const places = Array.from(daySchedule.places);
        const [removed] = places.splice(source.index, 1);
        places.splice(destination.index, 0, removed);

        const updatedPlaces = places.map((place, index) => ({
            ...place,
            order: index + 1,
        }));

        const updatedSchedule = { ...editedSchedule };
        updatedSchedule.days[selectedDayIndex].places = updatedPlaces;
        setEditedSchedule(updatedSchedule);

        // 경로 다시 그리기
        if (drawDayRoute) {
            clearAllRoutes();
            drawDayRoute(updatedSchedule.days[selectedDayIndex], selectedDayIndex);
        }
    };

    // 장소 삭제
    const handleRemovePlace = (placeToRemove) => {
        const updatedSchedule = { ...editedSchedule };
        updatedSchedule.days[selectedDayIndex].places = updatedSchedule.days[selectedDayIndex].places.filter(
            place => place.title !== placeToRemove.title
        );
        setEditedSchedule(updatedSchedule);

        // 경로 다시 그리기
        if (clearAllRoutes && drawDayRoute) {
            clearAllRoutes();
            drawDayRoute(updatedSchedule.days[selectedDayIndex], selectedDayIndex);
        }
    };

    // 장소 추가 처리
    const handleAddPlace = (place) => {
        const newPlace = {
            title: place.title,
            duration: 120,
            order: editedSchedule.days[selectedDayIndex].places.length + 1,
            latitude: place.mapy ? Number(parseFloat(place.mapy).toFixed(6)) : Number(parseFloat(place.latitude).toFixed(6)),
            longitude: place.mapx ? Number(parseFloat(place.mapx).toFixed(6)) : Number(parseFloat(place.longitude).toFixed(6))
        };

        const updatedSchedule = { ...editedSchedule };
        updatedSchedule.days[selectedDayIndex].places.push(newPlace);
        setEditedSchedule(updatedSchedule);

        // 새로운 장소가 추가된 후 경로 다시 그리기
        if (drawDayRoute) {
            clearAllRoutes();
            drawDayRoute(updatedSchedule.days[selectedDayIndex], selectedDayIndex);
        }
    };

    // 편집 완료
    const handleEditComplete = async () => {
        try {
            console.log('clearAllRoutes 함수 존재여부:', !!clearAllRoutes);
            console.log('drawDayRoute 함수 존재여부:', !!drawDayRoute);
            console.log('editedSchedule:', editedSchedule);

            if (clearAllRoutes) {
                clearAllRoutes();
            }

            await onSave(editedSchedule);

            // 모든 일차의 경로를 다시 그리기
            if (drawDayRoute) {
                for (let i = 0; i < editedSchedule.days.length; i++) {
                    console.log(`${i + 1}일차 경로 그리기 시작`);
                    await drawDayRoute(editedSchedule.days[i], i);
                }
            }
        } catch (error) {
            console.error('일정 편집 완료 중 오류:', error);
            alert('일정 편집 완료 중 오류가 발생했습니다.');
        }
    };

    return (
        <>
            <div className="schedule-edit-container">
                <div className="edit-header">
                    <h5>일정 편집</h5>
                    <div className="btn-group">
                        <button className="btn btn-primary" onClick={handleEditComplete}>
                            완료
                        </button>
                        <button className="btn btn-outline-secondary" onClick={onCancel}>
                            취소
                        </button>
                    </div>
                </div>

                <div className="days-tabs">
                    {editedSchedule.days.map((day, index) => (
                        <button
                            key={index}
                            className={`day-tab ${selectedDayIndex === index ? "active" : ""}`}
                            onClick={() => setSelectedDayIndex(index)}
                        >
                            {index + 1}일차
                        </button>
                    ))}
                </div>

                <div className="places-container">
                    <DragDropContext onDragEnd={handleDragEnd}>
                        <Droppable droppableId="places">
                            {(provided) => (
                                <div
                                    {...provided.droppableProps}
                                    ref={provided.innerRef}
                                    className="places-list"
                                >
                                    {editedSchedule.days[selectedDayIndex].places.map(
                                        (place, index) => (
                                            <Draggable
                                                key={`${place.title}-${index}`}
                                                draggableId={`${place.title}-${index}`}
                                                index={index}
                                            >
                                                {(provided) => (
                                                    <div
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        {...provided.dragHandleProps}
                                                        className="place-item"
                                                    >
                                                        <div className="place-content">
                                                            <span className="order-badge">{index + 1}</span>
                                                            <span className="place-title">{place.title}</span>
                                                        </div>
                                                        <button
                                                            className="btn btn-sm btn-outline-danger"
                                                            onClick={() => handleRemovePlace(place)}
                                                        >
                                                            <i className="bi bi-trash"></i>
                                                        </button>
                                                    </div>
                                                )}
                                            </Draggable>
                                        )
                                    )}
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>
                    </DragDropContext>

                    <button
                        className="btn btn-outline-primary add-place-btn"
                        onClick={() => setShowPlaceSelector(true)}
                    >
                        <i className="bi bi-plus"></i> 장소 추가
                    </button>
                </div>
            </div>

            {showPlaceSelector && (
                <div className="modal fade show" style={{ display: 'block' }}>
                    <div className="modal-backdrop fade show"></div>
                    <div className="modal-dialog modal-dialog-centered modal-lg">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">장소 선택</h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setShowPlaceSelector(false)}
                                ></button>
                            </div>
                            <div className="modal-body p-0" style={{ height: '600px' }}>
                                <PlaceSelector
                                    onAddPlace={handleAddPlace}
                                    onRemovePlace={handleRemovePlace}
                                    selectedPlaces={editedSchedule.days[selectedDayIndex].places}
                                    onClose={() => setShowPlaceSelector(false)}
                                    onComplete={() => setShowPlaceSelector(false)}
                                    isEditMode={true}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ScheduleEdit;