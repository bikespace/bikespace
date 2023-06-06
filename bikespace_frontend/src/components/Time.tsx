import React from "react";
import { ParkingDuration } from "../interfaces/Submission";
import BaseButton from "./BaseButton";
import DatePicker, { ReactDatePicker } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const Time = (props: { parkingDuration: ParkingDuration, onParkingDurationChanged: (parkingDuration: ParkingDuration) => void, date: Date, onDateChanged: (date: Date) => void }) => {
    const parkingDuration = props.parkingDuration;
    const date = props.date;
    const handleDate = (chosenDate: Date, e: React.SyntheticEvent<any>) => {
        props.onDateChanged(chosenDate);
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
            <DatePicker 
                showTimeSelect
                wrapperClassName="date-picker" 
                selected={date} 
                onChange={handleDate} 
                dateFormat="MMMM d, yyyy h:mm aa"
                popperProps={{
                    positionFixed: true
                }}
                />
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