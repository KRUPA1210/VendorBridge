package com.mkdh.vendorbridge.Utils;

import com.resend.Resend;
import com.resend.core.exception.ResendException;
import com.resend.services.emails.model.CreateEmailOptions;
import com.resend.services.emails.model.CreateEmailResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

@Component
public class EmailUtils {
    private final Logger log = LoggerFactory.getLogger(EmailUtils.class);

    private final Resend resend;

    public EmailUtils(Resend resend) {
        this.resend = resend;
    }

    public void sendEmail(String from, String to, String subject, String htmlContent) {

        CreateEmailOptions params = CreateEmailOptions.builder()
                .from(from)
                .to(to)
                .subject(subject)
                .html(htmlContent)
                .build();

        try {
            CreateEmailResponse data = resend.emails().send(params);
            log.info("Email sent successfully: {}", data.getId());
        } catch (ResendException e) {
            log.info("Error sending email: {}", e.getMessage());
        }
    }
}
