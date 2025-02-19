import React, { useEffect } from "react";
import './loader.css';

export default function Loader() {
    useEffect(() => {
        const disableInteractions = (event) => {
            event.preventDefault();
            event.stopPropagation();
        };

        document.body.addEventListener('click', disableInteractions, { capture: true });

        return () => {
            document.body.removeEventListener('click', disableInteractions, { capture: true });
        };
    }, []);

    return (
        <div id='loader'>
            <div id="imgDivLoader"></div>
            <div>
                <p><i>Loading...</i></p>
            </div>
        </div>
    );
}
