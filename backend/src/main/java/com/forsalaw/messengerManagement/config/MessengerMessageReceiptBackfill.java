package com.forsalaw.messengerManagement.config;

import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Une fois : aligne read/delivered sur les timestamps de conversation deja presents (avant accusés par message).
 */
@Component
@Order(50)
@Profile("!test")
@RequiredArgsConstructor
@Slf4j
public class MessengerMessageReceiptBackfill implements ApplicationRunner {

    private final EntityManager entityManager;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        int r1 = entityManager.createNativeQuery(
                "UPDATE messenger_message m SET read_at_by_client = c.client_last_read_at "
                        + "FROM messenger_conversation c WHERE m.conversation_id = c.id "
                        + "AND m.sender_role = 'AVOCAT' AND c.client_last_read_at IS NOT NULL "
                        + "AND m.read_at_by_client IS NULL AND m.created_at <= c.client_last_read_at"
        ).executeUpdate();
        int r2 = entityManager.createNativeQuery(
                "UPDATE messenger_message m SET read_at_by_avocat = c.avocat_last_read_at "
                        + "FROM messenger_conversation c WHERE m.conversation_id = c.id "
                        + "AND m.sender_role = 'CLIENT' AND c.avocat_last_read_at IS NOT NULL "
                        + "AND m.read_at_by_avocat IS NULL AND m.created_at <= c.avocat_last_read_at"
        ).executeUpdate();
        int r3 = entityManager.createNativeQuery(
                "UPDATE messenger_message SET delivered_at_to_client = read_at_by_client "
                        + "WHERE sender_role = 'AVOCAT' AND read_at_by_client IS NOT NULL "
                        + "AND delivered_at_to_client IS NULL"
        ).executeUpdate();
        int r4 = entityManager.createNativeQuery(
                "UPDATE messenger_message SET delivered_at_to_avocat = read_at_by_avocat "
                        + "WHERE sender_role = 'CLIENT' AND read_at_by_avocat IS NOT NULL "
                        + "AND delivered_at_to_avocat IS NULL"
        ).executeUpdate();
        if (r1 + r2 + r3 + r4 > 0) {
            log.info("Messenger receipt backfill: read_client={}, read_avocat={}, deliv_client={}, deliv_avocat={}",
                    r1, r2, r3, r4);
        }
    }
}
