# **TaskPro – Personal Task Management App**

TaskPro is a full-stack, single-user task management application designed to help individuals organize their personal tasks efficiently. It features a secure, token-based authentication system and a clean, modern user interface for managing tasks.

## **Features**

* **Secure User Authentication**: Register and log in with JWT token-based authentication.  
* **Task Management (CRUD)**: Create, read, update, and delete personal tasks.  
* **Task Attributes**: Each task includes a title, description, due date, priority (Low, Medium, High), and status.  
* **Mark as Complete**: Easily toggle the completion status of any task.  
* **Dynamic Filtering**: Filter the task list to view all, pending, or completed tasks.  
* **Live Search**: Instantly search for tasks by their title or priority.  
* **Automatic Sorting**: Tasks are automatically sorted by their due date.  
* **Responsive UI**: The frontend is built with Bootstrap 5 for a seamless experience on any device.

## **Tech Stack**

* **Backend**: Python, Django, Django REST Framework  
* **Frontend**: HTML, CSS, JavaScript, Bootstrap 5  
* **Database**: MySQL  
* **Authentication**: JSON Web Tokens (JWT) using djangorestframework-simplejwt  
* **API Communication**: Fetch API

## **Setup and Installation**

Follow these steps to get the project running on your local machine.

### **Prerequisites**

* Python 3.8+  
* A running MySQL database server

### **1\. Clone the Repository**

git clone \<your-repository-url\>  
cd taskpro\_project

### **2\. Set Up the Backend**

1. **Create and Activate a Virtual Environment:**  
   \# For Windows  
   python \-m venv venv  
   .\\venv\\Scripts\\activate

   \# For macOS/Linux  
   python3 \-m venv venv  
   source venv/bin/activate

2. **Install Dependencies:**  
   pip install \-r requirements.txt

3. Configure the Database:  
   Open taskpro\_project/settings.py and update the DATABASES section with your MySQL credentials:  
   DATABASES \= {  
       'default': {  
           'ENGINE': 'django.db.backends.mysql',  
           'NAME': 'taskpro\_db',      \# Your database name  
           'USER': 'your\_db\_user',   \# Your database user  
           'PASSWORD': 'your\_db\_password', \# Your database password  
           'HOST': 'localhost',  
           'PORT': '3306',  
       }  
   }

4. **Run Database Migrations:**  
   python manage.py migrate

5. **Start the Django Server:**  
   python manage.py runserver

   The backend API will now be running at http://127.0.0.1:8000.

### **3\. Set Up the Frontend**

1. Place the index.html, style.css, and app.js files in a separate folder outside the Django project.  
2. Navigate to that folder and run a simple local server. The easiest way is with Python's built-in server:  
   \# This will start a server, usually on port 8000 or 8080  
   python \-m http.server 8080

   Alternatively, you can use a tool like the **Live Server** extension in Visual Studio Code.  
3. Open your web browser and navigate to http://localhost:8080 to use the application.

## **API Endpoints**

The backend provides the following API endpoints:

| Method | Endpoint | Description |
| :---- | :---- | :---- |
| POST | /api/register/ | Create a new user. |
| POST | /api/token/ | Log in to get an access and refresh token. |
| POST | /api/token/refresh/ | Refresh an expired access token. |
| GET | /api/tasks/ | Get all tasks for the authenticated user. |
| POST | /api/tasks/ | Create a new task. |
| GET | /api/tasks/{id}/ | Get a single task by its ID. |
| PUT | /api/tasks/{id}/ | Update a task by its ID. |
| DELETE | /api/tasks/{id}/ | Delete a task by its ID. |

