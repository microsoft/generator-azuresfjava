<% if (packageName) { %>package <%= packageName %>;<% } %>

import java.util.concurrent.CompletableFuture;

import microsoft.servicefabric.actors.Actor;
import microsoft.servicefabric.actors.Readonly;

public interface <%= actorName %> extends Actor {
	@Readonly   
	CompletableFuture<Integer> getCountAsync();

	CompletableFuture<?> setCountAsync(int count);
}