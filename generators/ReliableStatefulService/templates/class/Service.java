<% if (packageName) { %>package <%= packageName %>;<% } %>

import java.util.concurrent.CompletableFuture;
import java.util.ArrayList;
import java.util.List;

import microsoft.servicefabric.data.ReliableStateManager;
import microsoft.servicefabric.data.Transaction;
import microsoft.servicefabric.data.collections.ReliableCollection;
import microsoft.servicefabric.data.collections.ReliableHashMap;
import microsoft.servicefabric.services.communication.runtime.ServiceReplicaListener;
import microsoft.servicefabric.services.runtime.StatefulService;
import system.fabric.CancellationToken;
import system.fabric.StatefulServiceContext;

import system.fabric.CancellationToken;

public class <%= serviceClassName %> extends StatefulService {
    private ReliableStateManager stateManager;
    
    protected <%= serviceClassName %> (StatefulServiceContext statefulServiceContext, ReliableStateManager reliableStateManager) {
        super (statefulServiceContext);
        this.stateManager = reliableStateManager;
    }

    @Override
    protected List<ServiceReplicaListener> createServiceReplicaListeners() {
        // Create your own ServiceReplicaListeners and add to the listenerList.
        List<ServiceReplicaListener> listenerList = new ArrayList<>();
        // listenerList.add(listener1);
        return listenerList;
    }

    @Override
    protected CompletableFuture<?> runAsync(CancellationToken cancellationToken) {
    // TODO: Replace the following sample code with your own logic 
    // or remove this runAsync override if it's not needed in your service.
    Transaction tx = stateManager.createTransaction();
    return this.stateManager.<String, Long>getOrAddReliableHashMapAsync(tx, "myHashMap").thenCompose((map) -> {
        return map.computeAsync(tx, "counter", (k, v) -> {
            if (v == null)
                return 1L;
            else
                return ++v;
        }, Duration.ofSeconds(4), cancellationToken).thenApply((l) -> {
            return tx.commitAsync().handle((r, x) -> {
                if (x != null) {
                    logger.log(Level.SEVERE, x.getMessage());
                }
                try {
                    tx.close();
                } catch (Exception e) {
                    System.out.println(x.getMessage());
                    logger.log(Level.SEVERE, e.getMessage());
                }
                return null;
            });
        });
    });

    }
}

