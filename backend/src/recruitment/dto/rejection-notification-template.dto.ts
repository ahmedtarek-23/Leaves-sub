export class RejectionNotificationTemplateDto {
  templateKey: string;
  subject: string;
  body: string;
  // TODO[SCHEMA]: REC-022 / BR-37 suggest reusable rejection email templates, but schema has no dedicated template entity.
}