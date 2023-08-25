import React, { useState, useEffect, useCallback } from 'react';
import './main.css';
import TaskList from '../components/Tasks/TaskList';
import NewTask from '../components/Tasks/NewTask';
import { useNavigate } from 'react-router-dom'
function Main() {
    const [tasks, setTasks] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const cookieToken = document.cookie
            .split('; ')
            .find(row => row.startsWith('token='))
            ?.split('=')[1]
        const userIdToken = document.cookie
            .split('; ')
            .find(row => row.startsWith('userId='))
            ?.split('=')[1]
        if (!cookieToken || !userIdToken) {
            navigate('/login')
        }
    }, [navigate])

    const fetchTasks = useCallback(function () {
        const cookieToken = document.cookie
            .split('; ')
            .find(row => row.startsWith('token='))
            ?.split('=')[1] || 'token';
        const userIdToken = document.cookie
            .split('; ')
            .find(row => row.startsWith('userId='))
            ?.split('=')[1] || 'userId';

        fetch(`http://localhost:1779/${userIdToken}/tasks`, {
            headers: {
                'Authorization': `Bearer ${cookieToken}`
            }
        })
            .then(function (response) {
                return response.json();
            })
            .then(function (jsonData) {
                setTasks(jsonData?.tasks || []);
                console.log(jsonData);
            })
            .catch(err => {
                console.error(err)
                setTasks([])
            });
    }, []);

    useEffect(
        function () {
            fetchTasks();
        },
        [fetchTasks]
    );

    function addTaskHandler(task) {
        const cookieToken = document.cookie
            .split('; ')
            .find(row => row.startsWith('token='))
            ?.split('=')[1] || 'token';
        const userIdToken = document.cookie
            .split('; ')
            .find(row => row.startsWith('userId='))
            ?.split('=')[1] || 'userId';

        fetch(`http://localhost:1779/${userIdToken}/tasks`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${cookieToken}`
            },
            body: JSON.stringify(task),
        })
            .then(function (response) {
                console.log(response);
                return response.json();
            })
            .then(function (resData) {
                console.log(resData);
            });
    }

    return (
        <div className='App'>
            <section>
                <NewTask onAddTask={addTaskHandler} />
            </section>
            <section>
                <button onClick={fetchTasks}>Fetch Tasks</button>
                <TaskList tasks={tasks} />
            </section>
        </div>
    );
}

export default Main;