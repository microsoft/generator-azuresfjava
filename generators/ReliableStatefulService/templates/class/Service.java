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
    ReliableHashMap<String> map = (ReliableHashMap<String>) stateManager.getOrAddAsync("mapName1").get();
                while (true)
                {
                    cancellationToken.throwIfCancellationRequested();
    
                    try (Transaction tx = stateManager.CreateTransaction())
                    {
                        ConditionalValue<String> cv = map.getAsync(tx, "counter", Duration.ofSeconds(60)).get();
                        
                        if(cv.hasValue()) {
                            System.out.println("The counter has value : " + cv.getValue());
                            else {
                                System.out.println("The counter key does not exist");
                                map.putAsync(tx, counter, 2, Duration.ofSeconds(60)).get();
                            }
    
                        // If an exception is thrown before calling CommitAsync, the transaction aborts, all changes are 
                        // discarded, and nothing is saved to the secondary replicas.
                        tx.commitAsync().get();
                        tx.close();
                    }
    
                    Thread.sleep(1);
                }
            }
        }
}

