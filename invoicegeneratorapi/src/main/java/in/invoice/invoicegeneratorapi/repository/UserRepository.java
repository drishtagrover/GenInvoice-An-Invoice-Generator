package in.invoice.invoicegeneratorapi.repository;

import in.invoice.invoicegeneratorapi.entity.User;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface UserRepository extends MongoRepository<User,String>{
    Optional<User> findByClerkId(String clerkId);
    boolean existsByClerkId(String clerkId);
}
