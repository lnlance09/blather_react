import React from 'react';
import Moment from 'react-moment';

const hoursOffset = new Date().getTimezoneOffset()/60

export const adjustTimezone = date => new Date(date).getTime()-(hoursOffset*3600000)

export const dateDifference = (dateOne, dateTwo) => {
    if(new Date(dateOne) > new Date(dateTwo)) {
        return (
            <div>
                <Moment from={adjustTimezone(dateOne)} ago>{adjustTimezone(dateTwo)}</Moment> prior
            </div>
        )
    }
    return (
        <div>
            <Moment to={adjustTimezone(dateOne)} ago>{adjustTimezone(dateTwo)}</Moment> later
        </div>
    )
}