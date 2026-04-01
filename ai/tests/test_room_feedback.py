from fastapi.testclient import TestClient

from main import app

client = TestClient(app)


def test_python_room_feedback_returns_short_hint() -> None:
    response = client.post(
        "/rooms/python/feedback",
        json={
            "trigger": "runtime_error",
            "task": "Loop through scores and print a label for each learner.",
            "code": "scores = [('Asha', 88)]\nfor name, score in scores:\n    print(label)\n",
            "stdout": "",
            "stderr": "Traceback (most recent call last):\n  File \"main.py\", line 3, in <module>\n    print(label)\nNameError: name 'label' is not defined",
            "error": {
                "type": "NameError",
                "message": "name 'label' is not defined",
                "traceback": "Traceback (most recent call last):\n  File \"main.py\", line 3, in <module>\n    print(label)\nNameError: name 'label' is not defined",
                "line": 3,
            },
            "student": {
                "name": "Aarav",
                "skill_level": "Beginner",
                "current_path": "Python Room",
                "progress": 22,
                "learning_goals": ["Write cleaner Python loops"],
            },
        },
    )

    assert response.status_code == 200
    data = response.json()
    assert data["provider"] == "local-room-feedback"
    assert data["model_used"] is None
    assert "line 3" in data["reply"].lower()
    assert "label" in data["reply"]
    assert "print(label)" in data["reply"]
    assert "run again" in data["reply"].lower()
