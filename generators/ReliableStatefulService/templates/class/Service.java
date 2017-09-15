<% if (packageName) { %>package <%= packageName %>;<% } %>

import java.util.concurrent.CompletableFuture;
import java.util.List;

import microsoft.servicefabric.services.communication.runtime.ServiceInstanceListener;
import microsoft.servicefabric.services.runtime.StatelessService;

import system.fabric.CancellationToken;

public class <%= serviceClassName %> extends StatelessService {

    @Override
    protected List<ServiceInstanceListener> createServiceInstanceListeners() {
        // TODO: If your service needs to handle user requests, return the list of ServiceInstanceListeners from here.
        return super.createServiceInstanceListeners();
    }

    @Override
    protected CompletableFuture<?> runAsync(CancellationToken cancellationToken) {
        // TODO: Replace the following with your own logic.
        return super.runAsync(cancellationToken);
    }
}
