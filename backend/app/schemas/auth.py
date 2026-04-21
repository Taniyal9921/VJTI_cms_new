from pydantic import BaseModel, EmailStr, Field, field_validator, model_validator

_SELF_REGISTER_ROLES = frozenset(
    {"Student", "Faculty", "HOD", "HK_Manager", "Maint_Manager", "Staff_Maint", "Staff_HK"}
)


class RegisterRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    email: EmailStr
    phone: str | None = Field(None, max_length=32)
    password: str = Field(..., min_length=8, max_length=128)
    role: str = Field(default="Student")
    department_name: str | None = Field(None, max_length=255)
    designation: str | None = Field(None, max_length=128)
    student_reg_no: str | None = Field(None, max_length=64)
    year_of_study: str | None = Field(None, max_length=32)

    @field_validator("department_name", mode="before")
    @classmethod
    def normalize_department_name(cls, v: object) -> str | None:
        if v is None:
            return None
        if isinstance(v, str):
            s = v.strip()
            return s if s else None
        return v  # type: ignore[return-value]

    @model_validator(mode="after")
    def validate_role_fields(self) -> "RegisterRequest":
        if self.role not in _SELF_REGISTER_ROLES:
            raise ValueError("Invalid role for registration")
        if self.role == "Student":
            if not self.department_name:
                raise ValueError("Department is required for students")
            if not (self.student_reg_no and self.student_reg_no.strip()):
                raise ValueError("Student ID is required")
            if not (self.year_of_study and self.year_of_study.strip()):
                raise ValueError("Year of study is required")
        elif self.role == "Faculty":
            if not self.department_name:
                raise ValueError("Department is required for faculty")
            if not (self.designation and self.designation.strip()):
                raise ValueError("Designation is required for faculty")
        elif self.role == "HOD":
            if not self.department_name:
                raise ValueError("Department is required for HOD")
        return self


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
