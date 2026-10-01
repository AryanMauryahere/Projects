package com.turbo.racer;

import jakarta.validation.Valid;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/scores")
public class ScoreController {
    private final ScoreRepository repo;

    public ScoreController(ScoreRepository repo) { this.repo = repo; }

    @GetMapping("/top")
    public List<Score> top(@RequestParam(defaultValue = "10") int limit) {
        return repo.findAllByOrderByTimeMsAsc(PageRequest.of(0, Math.max(1, Math.min(limit, 50))));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Score submit(@Valid @RequestBody ScoreRequest req) {
        Score s = new Score();
        s.setName(req.name().trim());
        s.setTimeMs(req.timeMs());
        return repo.save(s);
    }
}
