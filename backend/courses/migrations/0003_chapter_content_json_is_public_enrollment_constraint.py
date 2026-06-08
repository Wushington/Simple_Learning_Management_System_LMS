from django.db import migrations, models


def copy_visibility(apps, schema_editor):
    Chapter = apps.get_model("courses", "Chapter")
    for chapter in Chapter.objects.all():
        chapter.is_public = not chapter.hidden
        chapter.save(update_fields=["is_public"])


class Migration(migrations.Migration):

    dependencies = [
        ("courses", "0002_chapter_hidden_alter_chapter_number_enrollment"),
    ]

    operations = [
        migrations.AddField(
            model_name="chapter",
            name="is_public",
            field=models.BooleanField(default=False),
        ),
        migrations.RunPython(copy_visibility, migrations.RunPython.noop),
        migrations.RemoveField(
            model_name="chapter",
            name="hidden",
        ),
        migrations.AlterField(
            model_name="chapter",
            name="content",
            field=models.JSONField(default=list),
        ),
        migrations.AlterUniqueTogether(
            name="enrollment",
            unique_together=set(),
        ),
        migrations.AddConstraint(
            model_name="enrollment",
            constraint=models.UniqueConstraint(
                fields=("student", "course"),
                name="unique_student_enrollment_per_course",
            ),
        ),
    ]
