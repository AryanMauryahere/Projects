package com.turbo.racer;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** Payload for submitting a finished race. timeMs bounds reject obviously fake times. */
public record ScoreRequest(
        @NotBlank @Size(max = 16) String name,
        @Min(60_000) @Max(3_600_000) long timeMs) {
}
