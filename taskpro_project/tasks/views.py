from django.contrib.auth.models import User
from rest_framework import viewsets, permissions, filters, generics
from .models import Task
from .serializers import TaskSerializer, UserSerializer

# For User Registration
class UserCreate(generics.CreateAPIView):
    """
    Allows new users to be created. This is a public-facing endpoint.
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = (permissions.AllowAny,)


# For Task Management (CRUD)
class TaskViewSet(viewsets.ModelViewSet):
    """
    Handles all Create, Read, Update, and Delete operations for tasks.
    It ensures users can only access and manage their own tasks.
    """
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated]

    # Use built-in DRF backends for searching and ordering.
    # The problematic DjangoFilterBackend has been removed.
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]

    # Define the fields available for searching and ordering.
    search_fields = ['title', 'priority']
    ordering_fields = ['due_date']
    ordering = ['due_date'] # Sets the default sort order to ascending by due date.

    def get_queryset(self):
        """
        This method is customized to:
        1. Return only the tasks belonging to the currently authenticated user.
        2. Manually filter tasks by their completion status based on a URL parameter.
        """
        user = self.request.user
        queryset = Task.objects.filter(user=user)

        # Manually handle filtering for '?status=true' or '?status=false'.
        status_param = self.request.query_params.get('status')
        if status_param is not None:
            # Convert the string from the URL into a boolean value.
            is_completed = status_param.lower() == 'true'
            queryset = queryset.filter(status=is_completed)

        return queryset

    def perform_create(self, serializer):
        """
        When a new task is created, this method automatically assigns it
        to the user who made the request.
        """
        serializer.save(user=self.request.user)