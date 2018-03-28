<% if (packageName) { %>package <%= packageName %>;<% } %>

import java.util.concurrent.CompletableFuture;

import microsoft.servicefabric.actors.Actor;

public interface <%= actorName %> extends Actor {
	CompletableFuture<Integer> getCountAsync();

	CompletableFuture<?> setCountAsync(int count);
}
