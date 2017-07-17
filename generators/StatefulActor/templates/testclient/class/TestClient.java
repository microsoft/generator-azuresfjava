<% if (packageName) { %>package <%= packageName %>;<% } %>

import <%= actorFQN %>;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.concurrent.ExecutionException;

import microsoft.servicefabric.actors.ActorExtensions;
import microsoft.servicefabric.actors.ActorId;
import microsoft.servicefabric.actors.ActorProxyBase;

public class <%= testClassName %> {

    /**
    * @param args the command line arguments
    */
    public static void main(String[] args) throws URISyntaxException, InterruptedException, ExecutionException {
        <%= actorName %> actorProxy = ActorProxyBase.create(<%= actorName %>.class, new ActorId("From Actor 1"), new URI("fabric:/<%= appName %>/<%= serviceName %>"));
        int count = actorProxy.getCountAsync().get();
        System.out.println("From Actor:" + ActorExtensions.getActorId(actorProxy) + " CurrentValue:" + count);
        actorProxy.setCountAsync(count + 1).get();
    }
}
