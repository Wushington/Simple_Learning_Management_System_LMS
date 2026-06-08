import secrets
import string

from django.db import migrations, models


COURSE_CODE_ALPHABET = string.ascii_uppercase + string.digits
COURSE_CODE_LENGTH = 8


def generate_course_code():
    return "".join(
        secrets.choice(COURSE_CODE_ALPHABET) for _ in range(COURSE_CODE_LENGTH)
    )


def populate_course_codes(apps, schema_editor):
    Course = apps.get_model("courses", "Course")
    used_codes = set(
        Course.objects.exclude(course_code="").values_list("course_code", flat=True)
    )

    for course in Course.objects.filter(course_code=""):
        course_code = generate_course_code()
        while course_code in used_codes:
            course_code = generate_course_code()

        used_codes.add(course_code)
        course.course_code = course_code
        course.save(update_fields=["course_code"])


class Migration(migrations.Migration):
    dependencies = [
        ("courses", "0003_chapter_visibility_content"),
    ]

    operations = [
        migrations.AddField(
            model_name="course",
            name="course_code",
            field=models.CharField(blank=True, db_index=True, max_length=8),
        ),
        migrations.RunPython(populate_course_codes, migrations.RunPython.noop),
        migrations.AlterField(
            model_name="course",
            name="course_code",
            field=models.CharField(
                blank=True,
                db_index=True,
                max_length=8,
                unique=True,
            ),
        ),
    ]
