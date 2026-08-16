package com.splitride.splitride.service;

import com.splitride.splitride.entity.GroupMember;
import com.splitride.splitride.entity.RideGroup;
import com.splitride.splitride.repository.GroupMemberRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Service
public class SummaryServiceImpl implements SummaryService {

    @Autowired
    private GroupMemberRepository groupMemberRepository;

    @Value("${groq.api.key}")
    private String apiKey;

    @Override
    public String generateSummary(RideGroup group) {
        List<GroupMember> members = groupMemberRepository.findByGroupId(group.getId());

        StringBuilder memberInfo = new StringBuilder();
        for (GroupMember member : members) {
            memberInfo.append(String.format("- %s, drop point: %s, fare share: ₹%s\n",
                    member.getUser().getName(), member.getDropPoint(), member.getFareShare()));
        }

        String prompt = String.format(
                "Write a short, friendly 2-3 sentence trip confirmation summary for a ride-sharing app. " +
                        "Trip: from %s to %s, departing at %s, total fare ₹%s. Members:\n%s" +
                        "Keep it warm and concise, like a confirmation message a user would actually enjoy reading.",
                group.getOrigin(), group.getDestination(), group.getDepartureTime(),
                group.getTotalFare(), memberInfo.toString()
        );

        String url = "https://api.groq.com/openai/v1/chat/completions";

        Map<String, Object> requestBody = Map.of(
                "model", "llama-3.3-70b-versatile",
                "messages", List.of(
                        Map.of("role", "user", "content", prompt)
                )
        );

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(apiKey);
        HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);

        RestTemplate restTemplate = new RestTemplate();
        Map<String, Object> response = restTemplate.postForObject(url, request, Map.class);

        List<Map<String, Object>> choices = (List<Map<String, Object>>) response.get("choices");
        Map<String, Object> message = (Map<String, Object>) choices.get(0).get("message");

        return (String) message.get("content");
    }

}