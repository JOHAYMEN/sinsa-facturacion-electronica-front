// NotificationList.jsx
import React from 'react';

const NotificationList = ({ notifications }) => {
    return (
        <div style={{ position: 'fixed', top: 10, right: 280, zIndex: 1000 }}>
            {notifications.map((notification, index) => (
                <div key={index} style={{ margin: '10px', background: 'lightblue', padding: '10px', borderRadius: '5px' }}>
                    {notification.message}
                </div>
            ))}
        </div>
    );
};

export default NotificationList;

