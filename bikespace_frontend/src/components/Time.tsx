import React from "react";
import { ParkingDuration } from "../interfaces/Submission";
import BaseButton from "./BaseButton";

const Time = (props: { parkingDuration: ParkingDuration, onParkingDurationChanged: (parkingDuration: ParkingDuration) => void, dateTime: Date, onDateTimeChanged: (dateTime: Date) => void }) => {
    const parkingDuration = props.parkingDuration;
    const dateTime = props.dateTime;

    const handleDateTime = (e: React.ChangeEventHandler<HTMLInputElement>) => {
        e.preventDefault();
        let chosenDateTime = Date(e.target.value);
        props.onDateTimeChanged(chosenDateTime);
    };

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        let duration: ParkingDuration;
        switch (e.currentTarget.dataset.value) {
            case "minutes":
                duration = ParkingDuration.Minutes;
                break;
            case "hours":
                duration = ParkingDuration.Hours;
                break;
            case "overnight":
                duration = ParkingDuration.Overnight;
                break;
            case "multiday":
                duration = ParkingDuration.MultiDay;
                break;
            default:
                duration = ParkingDuration.Overnight;
                break;
        }
        props.onParkingDurationChanged(duration);
    };

    return (
        <div id="submission-time">
            <h2>When did this happen?</h2>
            <input type="datetime-local" onChange={handleDateTime}>
            </input>

            <h2>How long did you need to park?</h2>
            <ul title="How long did you need to park?">
                <li>
                    <BaseButton
                        active={parkingDuration.includes(ParkingDuration.Minutes)}
                        value="minutes"
                        onClick={handleClick}
                    >minutes</BaseButton>
                </li>
                <li>
                    <BaseButton
                        active={parkingDuration.includes(ParkingDuration.Hours)}
                        value="hours"
                        onClick={handleClick}
                    >hours</BaseButton>
                </li>
                <li>
                    <BaseButton
                        active={parkingDuration.includes(ParkingDuration.Overnight)}
                        value="overnight"
                        onClick={handleClick}
                    >overnight</BaseButton>
                </li>
                <li>
                    <BaseButton
                        active={parkingDuration.includes(ParkingDuration.MultiDay)}
                        value="multiday"
                        onClick={handleClick}
                    >multiday</BaseButton>
                </li>
            </ul>
        </div>
    );
};

export default Time;