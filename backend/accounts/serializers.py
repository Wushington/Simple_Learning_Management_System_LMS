from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from .models import User


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email", "role"]
        read_only_fields = ["id"]


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ["id", "username", "email", "password", "role"]
        read_only_fields = ["id"]

    def validate(self, attrs):
        password = attrs.get("password")
        user_attrs = attrs.copy()
        user_attrs.pop("password", None)
        user = User(**user_attrs)

        try:
            validate_password(password, user)
        except DjangoValidationError as error:
            raise serializers.ValidationError({"password": error.messages}) from error

        return attrs

    def create(self, validated_data):
        password = validated_data.pop("password")
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user
