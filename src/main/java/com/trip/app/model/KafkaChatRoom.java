package com.trip.app.model;

import lombok.Getter;
import lombok.Setter;

import java.io.Serializable;
import java.util.UUID;

/**
 * Redis에 저장되는 객체들은 Serialize 가능해야 함
 */
@Getter @Setter
public class KafkaChatRoom implements Serializable {
    private static final long serialVersionUID = 6494678977089006639L;

    private String roomId;
    private String name;

    public static KafkaChatRoom create(String name) {
        KafkaChatRoom kafkaChatRoom = new KafkaChatRoom();
        kafkaChatRoom.roomId = UUID.randomUUID().toString();
        kafkaChatRoom.name = name;
        return kafkaChatRoom;
    }

}
