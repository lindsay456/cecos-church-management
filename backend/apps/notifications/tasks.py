from celery import shared_task


@shared_task
def send_notification_task(notification_id):
    from apps.notifications.models import Notification
    from apps.notifications.services import _dispatch

    try:
        notif = Notification.objects.get(pk=notification_id)
        _dispatch(notif)
    except Notification.DoesNotExist:
        pass
