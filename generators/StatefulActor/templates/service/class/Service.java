<% if (packageName) { %>package <%= packageName %>;<% } %>

import java.time.Duration;

import java.util.logging.Level;
import java.util.logging.Logger;

import microsoft.servicefabric.actors.ActorRuntime;
import microsoft.servicefabric.actors.FabricActorService;

public class <%= serviceClassName %> {

private static final Logger logger = Logger.getLogger(<%= serviceClassName %>.class.getName());
    /* 
    This is the entry point of the service host process.
    */
    public static void main(String[] args) throws Exception {
        
        try {

            /*
            This line registers an Actor Service to host your actor class with the Service Fabric runtime.
            For more information, see http://aka.ms/servicefabricactorsplatform
            */
            ActorRuntime.registerActorAsync(<%= actorName %>Impl.class, (context, actorType) -> new FabricActorService(context, actorType, (a,b)-> new <%= actorName %>Impl(a,b)), Duration.ofSeconds(10));
            Thread.sleep(Long.MAX_VALUE);
        } catch (Exception e) {
            logger.log(Level.SEVERE, "Exception occured", e);
            throw e;
        }
    }
}

