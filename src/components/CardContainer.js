import React from 'react';

const CardContainer = ({ children }) => {
    return (
        <div className="square">
            <div className="content">
                <div className="table">
                    <div className="table-cell">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CardContainer